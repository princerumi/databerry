import {
  DatasourceStatus,
  DatasourceType,
  DatastoreVisibility,
} from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { UpdateDatastoreRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { deleteFolderFromS3Bucket } from '@app/utils/aws';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';
import refreshStoredTokensUsage from '@app/utils/refresh-stored-tokens-usage';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

const cors = Cors({
  methods: ['GET', 'DELETE', 'PATCH', 'HEAD'],
});

const handler = createAuthApiHandler();

export const getDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const search = req.query.search as string;
  const status = req.query.status as DatasourceStatus;
  const type = req.query.type as DatasourceType;
  const offset = parseInt((req.query.offset as string) || '0');
  const limit = parseInt((req.query.limit as string) || '100');
  const groupId = (req.query.groupId || null) as string | null;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          datasources: {
            where: {
              groupId: groupId,
              ...(search
                ? {
                    name: {
                      contains: search,
                    },
                  }
                : {}),
              ...(status
                ? {
                    status,
                  }
                : {}),
              ...(type
                ? {
                    type,
                  }
                : {}),
            },
          },
        },
      },
      datasources: {
        skip: offset * limit,
        take: limit,
        where: {
          groupId,
          ...(search
            ? {
                name: {
                  contains: search,
                },
              }
            : {}),
          ...(status
            ? {
                status,
              }
            : {}),
          ...(type
            ? {
                type,
              }
            : {}),
        },
        orderBy: {
          lastSynch: 'desc',
        },
        include: {
          _count: {
            select: {
              children: true,
            },
          },
          // Trick to know if at least one child is running or pending
          children: {
            where: {
              OR: [
                { status: DatasourceStatus.pending },
                { status: DatasourceStatus.running },
              ],
            },
            select: {
              id: true,
            },
            take: 1,
          },
        },
      },
      apiKeys: true,
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return datastore;
};

handler.get(respond(getDatastore));

export const updateDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const datastoreId = req.query.id as string;
  const data = req.body as UpdateDatastoreRequestSchema;
  const { isPublic, ...updates } = data;
  const session = req.session;
  const datastoreToUpdate = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    select: {
      organizationId: true,
    },
  });

  if (!datastoreToUpdate) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (datastoreToUpdate?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }
  return prisma.datastore.update({
    where: {
      id: data.id,
    },
    data: {
      ...updates,
      visibility: isPublic
        ? DatastoreVisibility.public
        : DatastoreVisibility.private,
    },
  });
};

handler.patch(
  validate({
    body: UpdateDatastoreRequestSchema,
    handler: respond(updateDatastore),
  })
);

export const deleteDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.$transaction(
    async (tx) => {
      await Promise.all([
        new DatastoreManager(datastore).delete(),

        deleteFolderFromS3Bucket(
          process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          `datastores/${datastore.id || 'UNKNOWN'}` // add UNKNOWN to avoid to delete all the folder 😅
        ),
      ]);

      await tx.datastore.delete({
        where: {
          id,
        },
      });
    },
    {
      maxWait: 10000, // 10s
      timeout: 60000, // 60s
    }
  );

  await refreshStoredTokensUsage(datastore.organizationId!);

  return datastore;
};

handler.delete(respond(deleteDatastore));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}

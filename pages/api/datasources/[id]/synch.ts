import { AppDatasource as Datasource, DatasourceStatus } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import prisma from '@app/utils/prisma-client';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';

const handler = createAuthApiHandler();

export const synchDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id,
    },
    include: {
      organization: {
        include: {
          usage: true,
        },
      },
    },
  });

  if (datasource?.organization?.id !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datasource?.organization?.usage!,
    plan: session?.organization?.currentPlan,
  });

  const updated = await prisma.appDatasource.update({
    where: {
      id,
    },
    data: {
      status: DatasourceStatus.pending,
    },
    include: {
      datastore: true,
    },
  });

  await triggerTaskLoadDatasource([
    {
      organizationId: session?.organization?.id!,
      datasourceId: datasource.id,
      priority: 2,
    },
  ]);

  return updated;
};

handler.post(respond(synchDatasource));

export default handler;

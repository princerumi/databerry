import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { Button } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import Avatar from '@mui/joy/Avatar';
import Badge from '@mui/joy/Badge';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet from '@mui/joy/Sheet';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import { ReactElement, useCallback, useEffect, useMemo } from 'react';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import ChatBox from '@app/components/ChatBox';
import { ConversationExport } from '@app/components/ConversationExport';
import ImproveAnswerModal from '@app/components/ImproveAnswerModal';
import Layout from '@app/components/Layout';
import { handleEvalAnswer } from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';
import { authOptions } from '@app/pages/api/auth/[...nextauth]';
import relativeDate from '@app/utils/relative-date';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

import { getLogs } from '../api/logs';
import { getConversation } from '../api/logs/[id]';

const LIMIT = 20;

export default function LogsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const conversationId = router.query.conversationId as string;
  const parentRef = React.useRef();
  const [state, setState] = useStateReducer({
    currentConversationId: undefined as string | undefined,
    hasReachedEnd: false,
    currentImproveAnswerID: undefined as string | undefined,
  });
  const getConversationsQuery = useSWRInfinite<
    Prisma.PromiseReturnType<typeof getLogs>
  >((pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) {
      setState({
        hasReachedEnd: true,
      });
      return null; // reached the end
    }

    const cursor = previousPageData?.[previousPageData?.length - 1]
      ?.id as string;

    return `/api/logs?cursor=${cursor || ''}&conversationId=${router.query
      .conversationId || ''}`;
  }, fetcher);

  const getConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(
    state.currentConversationId
      ? `/api/logs/${state.currentConversationId}`
      : null,
    fetcher
  );

  // Fetch single converstaion from query parameter (e.g: load converstaion from email notification)
  const getSingleConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(conversationId ? `/api/logs/${conversationId}` : null, fetcher);

  const conversations = useMemo(() => {
    return [
      ...(getSingleConversationQuery?.data
        ? [getSingleConversationQuery?.data]
        : []),
      ...(getConversationsQuery?.data?.flat() || [])?.filter(
        // Filter out single conversation from list
        (each) => each.id !== getSingleConversationQuery?.data?.id
      ),
    ];
  }, [getConversationsQuery?.data, getSingleConversationQuery?.data]);

  useEffect(() => {
    if (getSingleConversationQuery?.data?.id) {
      setState({
        currentConversationId: getSingleConversationQuery?.data?.id,
      });
    }
  }, [getSingleConversationQuery?.data?.id]);

  if (!session?.organization) return null;

  if (!getConversationsQuery.isLoading && conversations.length === 0) {
    return (
      <Alert
        variant="outlined"
        sx={{
          textAlign: 'center',
          justifyContent: 'center',
          maxWidth: 'sm',
          mx: 'auto',
        }}
      >
        <Stack justifyContent={'center'} alignItems={'center'} gap={1}>
          <Typography level="h4" color="primary">
            <InboxRoundedIcon />
          </Typography>
          <Stack>
            <Typography level="body-md">No Data</Typography>
            <Typography level="body-sm">
              All conversations with your agents will be visible here
            </Typography>
          </Stack>
        </Stack>
      </Alert>
    );
  }

  return (
    <Stack gap={2} sx={{ height: 'calc(100vh - 175px)' }}>
      {/* <Alert
        variant="soft"
        color="neutral"
        startDecorator={<InfoRoundedIcon />}
      >
        View all Agents conversations across all channels. Evaluate and improve
        answers.
      </Alert> */}
      <ConversationExport />

      <Sheet
        variant="outlined"
        sx={(theme) => ({
          height: '100%',
          borderRadius: 'sm',
        })}
      >
        <Stack direction={'row'} sx={{ height: '100%' }}>
          <List
            // aria-labelledby="ellipsis-list-demo"
            // sx={{ '--ListItemDecorator-size': '56px' }}
            ref={parentRef as any}
            sx={{
              width: 'sm',
              minWidth: 300,
              maxWidth: '30%',
              height: '100%',
              overflowY: 'auto',
              '--ListDivider-gap': '0px',
            }}
            size="sm"
          >
            <InfiniteScroll
              useWindow={false}
              getScrollParent={() => parentRef.current as any}
              loadMore={() => {
                if (
                  getConversationsQuery.isLoading ||
                  getConversationsQuery.isValidating
                )
                  return;

                getConversationsQuery.setSize(getConversationsQuery.size + 1);
              }}
              hasMore={!state.hasReachedEnd}
              loader={
                Array(3)
                  .fill(0)
                  .map((each, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem>
                        <Skeleton variant="text" />
                      </ListItem>

                      <ListDivider></ListDivider>
                    </React.Fragment>
                  )) as any
              }
            >
              {/* Add fragment to remove InfiniteScroll warning when empty conversations */}
              <React.Fragment />

              {conversations.map((each) => (
                <React.Fragment key={each.id}>
                  <ListItem
                    sx={(theme) => ({
                      py: 1,
                      '&:hover': {
                        cursor: 'pointer',
                        backgroundColor: theme.palette.action.hover,
                      },
                      ...(state.currentConversationId === each.id && {
                        backgroundColor: theme.palette.action.hover,
                      }),
                    })}
                    onClick={() => {
                      setState({
                        currentConversationId: each.id,
                      });
                    }}
                  >
                    <ListItemContent>
                      <Stack>
                        <Stack direction="row" justifyContent={'space-between'}>
                          <Typography>{each?.agent?.name}</Typography>

                          <Typography level="body-xs">
                            {relativeDate(each?.updatedAt)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent={'space-between'}
                          alignItems={'start'}
                          gap={1}
                        >
                          <Typography level="body-sm" noWrap>
                            {each?.messages?.[0]?.text}
                          </Typography>

                          {each?._count?.messages > 0 && (
                            <Chip
                              // variant="soft"
                              color="danger"
                              size="sm"
                            >
                              <Typography textColor={'common.white'}>
                                {each?._count?.messages}
                              </Typography>
                            </Chip>
                          )}
                        </Stack>
                        <Stack
                          direction="row"
                          sx={{
                            mt: 1,
                          }}
                          gap={1}
                        >
                          <Chip size="sm" color="neutral" variant="outlined">
                            {'🤖 '}
                            {each?.agent?.name}
                          </Chip>
                          <Chip size="sm" color="neutral" variant="outlined">
                            {'🚀 '}
                            {each?.channel}
                          </Chip>
                        </Stack>
                      </Stack>
                    </ListItemContent>
                  </ListItem>
                  <ListDivider />
                </React.Fragment>
              ))}
            </InfiniteScroll>

            {getConversationsQuery.isLoading && (
              <CircularProgress size="sm" sx={{ mx: 'auto', my: 2 }} />
            )}
          </List>
          <Divider orientation="vertical" />
          <Box sx={{ width: '100%', paddingX: 2 }}>
            <ChatBox
              messages={
                getConversationQuery?.data?.messages?.map((each) => ({
                  id: each.id,
                  from: each.from,
                  message: each.text,
                  createdAt: each.createdAt,
                  eval: each.eval,
                })) || []
              }
              onSubmit={async () => {}}
              readOnly={true}
              handleEvalAnswer={handleEvalAnswer}
              handleImprove={(message) => {
                setState({
                  currentImproveAnswerID: message?.id,
                });
              }}
              userImgUrl={session?.user?.image!}
            />
          </Box>
        </Stack>

        {state.currentImproveAnswerID && (
          <ImproveAnswerModal
            handleCloseModal={() => {
              setState({
                currentImproveAnswerID: '',
              });
            }}
            messageId={state.currentImproveAnswerID}
          />
        )}
      </Sheet>
    </Stack>
  );
}

LogsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);

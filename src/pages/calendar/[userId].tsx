import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from 'next';
import { NextSeo } from 'next-seo';
import { appRouter } from '~/server/api/root';
import { createInnerTRPCContext } from '~/server/api/trpc';
import { getServerAuthSession } from '~/server/auth';
import superjson from 'superjson';
import { TRPCError } from '@trpc/server';
import { useCalendarQuery } from '~/features/userCalendar/hooks/useCalendarQuery';

const Calendar: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ hasSharedCalendar }) => {
  const events = useCalendarQuery();

  return (
    <>
      <NextSeo title='Race calendar' />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{
  hasSharedCalendar: boolean;
}> = async ctx => {
  const session = await getServerAuthSession(ctx);
  const userId = ctx.query.userId as string | undefined;

  if (!userId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });

  try {
    await ssg.user.calendar.fetch({ userId });
  } catch (err) {
    if (err instanceof TRPCError) {
      switch (err.code) {
        case 'NOT_FOUND':
          return {
            redirect: {
              destination: '/',
              permanent: false,
            },
          };
        case 'FORBIDDEN':
          return {
            props: {
              session,
              hasSharedCalendar: false,
            },
          };
      }
    }
  }

  return {
    props: {
      session,
      hasSharedCalendar: true,
      trpcState: ssg.dehydrate(),
    },
  };
};

export default Calendar;

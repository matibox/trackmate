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
import UserCalendar from '~/features/userCalendar/components/Calendar';

const Calendar: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <>
      <NextSeo title='Race calendar' />
      <main className='min-h-screen w-full bg-slate-900 p-4 pt-[calc(var(--navbar-height)_+_1rem)] text-slate-50'>
        <div className='w-96'>
          <UserCalendar />
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
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
    await ssg.user.hasSharedCalendar.fetch({ userId });
  } catch (err) {
    if (err instanceof TRPCError) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      session,
      trpcState: ssg.dehydrate(),
    },
  };
};

export default Calendar;

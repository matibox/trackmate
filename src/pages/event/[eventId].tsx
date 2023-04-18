import {
  type InferGetServerSidePropsType,
  type GetServerSideProps,
  type NextPage,
} from 'next';
import { NextSeo } from 'next-seo';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/utils/api';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '~/server/api/root';
import { createInnerTRPCContext } from '~/server/api/trpc';
import superjson from 'superjson';
import { useMemo } from 'react';
import { capitilize } from '~/utils/helpers';

const EventPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ eventId }) => {
  const { data: event } = api.event.single.useQuery({ eventId });

  const tabTitle = useMemo(() => {
    if (!event) return 'Event';
    const { championship } = event;
    return championship
      ? `${capitilize(event.title ?? 'Event')} - ${capitilize(
          championship.name
        )}`
      : capitilize(event.title ?? 'Event');
  }, [event]);

  return (
    <>
      <NextSeo title={tabTitle} />
      <main className='min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)]'></main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{
  eventId: string;
}> = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const eventId = ctx.query.eventId as string | undefined;

  if (!eventId) {
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

  const event = await ssg.event.single.fetch({ eventId });

  if (!event) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const allowedUserIds = [
    event.manager?.id,
    ...event.drivers.map(driver => driver.id),
  ].filter((id): id is string => !!id);

  if (!allowedUserIds.includes(session.user?.id)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      eventId,
      trpcState: ssg.dehydrate(),
    },
  };
};

export default EventPage;
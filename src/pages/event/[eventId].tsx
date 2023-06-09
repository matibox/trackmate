import {
  type InferGetServerSidePropsType,
  type GetServerSideProps,
  type NextPage,
} from 'next';
import { NextSeo } from 'next-seo';
import { getServerAuthSession } from '~/server/auth';
import { type RouterOutputs } from '~/utils/api';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '~/server/api/root';
import { createInnerTRPCContext } from '~/server/api/trpc';
import superjson from 'superjson';
import { useMemo } from 'react';
import { capitilize } from '~/utils/helpers';
import EventTabs from '~/features/event/Tabs';
import { useEventQuery } from '~/features/event/hooks/useEventQuery';

const EventPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const event = useEventQuery();

  const title = useMemo(() => {
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
      <NextSeo title={title} />
      <main className='min-h-screen w-full bg-slate-900 p-4 pt-[calc(var(--navbar-height)_+_1rem)] text-slate-50'>
        <div className='mb-4'>
          <h1 className='text-xl font-semibold leading-none sm:text-3xl sm:leading-none'>
            {title}
          </h1>
          {event.championship?.organizer && (
            <span className='text-slate-400'>
              {event.championship.organizer}
            </span>
          )}
        </div>
        <EventTabs />
      </main>
    </>
  );
};

export type Event = NonNullable<RouterOutputs['event']['single']>;

export const getServerSideProps: GetServerSideProps = async ctx => {
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
      trpcState: ssg.dehydrate(),
    },
  };
};

export default EventPage;

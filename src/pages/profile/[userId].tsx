import { type GetServerSideProps, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useError } from '../../hooks/useError';
import { getServerAuthSession } from '../../server/auth';
import { api, type RouterOutputs } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import Tile from '@ui/Tile';
import Link from 'next/link';
import {
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalCircleIcon,
  DocumentArrowUpIcon,
  ArrowLeftIcon,
} from '@heroicons/react/20/solid';
import dayjs from 'dayjs';
import { type FC, useCallback, useMemo, useState } from 'react';
import { capitilize } from '../../utils/helpers';
import { useEventStore } from '../../store/useEventStore';
import { useResultStore } from '../../store/useResultStore';
import { useEditEventStore } from '../../store/useEditEventStore';
import { useSession } from 'next-auth/react';
import Button from '@ui/Button';
import cn from '../../lib/classes';
import EventDuration from '../../components/EventDuration';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

type Profile = RouterOutputs['user']['getProfile'];
type Result = NonNullable<NonNullable<Profile>['events'][number]['result']>;

function useStats(profile: Profile | undefined) {
  const countStats = useCallback(
    (filterFn: (result: Result) => boolean) => {
      if (!profile) return 0;
      const { events } = profile;
      const results = events
        .filter(event => event.result)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(event => event.result!);

      return results.filter(filterFn).length;
    },
    [profile]
  );

  const podiums = useMemo(() => {
    return countStats(result => {
      const { racePosition } = result;
      if (racePosition) return racePosition <= 3;
      return false;
    });
  }, [countStats]);

  const wins = useMemo(() => {
    return countStats(result => {
      const { racePosition } = result;
      if (racePosition) return racePosition === 1;
      return false;
    });
  }, [countStats]);

  const polePositions = useMemo(() => {
    return countStats(result => {
      const { qualiPosition } = result;
      if (qualiPosition) return qualiPosition === 1;
      return false;
    });
  }, [countStats]);

  const raceStarts = useMemo(
    () => countStats(result => !result.DNS),
    [countStats]
  );

  const DNFs = useMemo(() => countStats(result => result.DNF), [countStats]);

  return { wins, podiums, polePositions, raceStarts, DNFs };
}

const Profile: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { Error, setError } = useError();

  const { data: profile, isLoading } = api.user.getProfile.useQuery(
    { userId: userId as string },
    {
      enabled: Boolean(userId),
      onError: err => setError(err.message),
    }
  );

  const { wins, podiums, polePositions, raceStarts, DNFs } = useStats(profile);

  return (
    <>
      <NextSeo title={profile?.name ?? 'Profile'} />
      <main className='relative min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <Error />
        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3'>
          <Tile className='xl:col-span-2' isLoading={isLoading}>
            <div className='flex items-center gap-4'>
              <Image
                src={profile?.image ?? '/DefaultAvatar.png'}
                alt={`${profile?.name ?? 'user'}'s avatar`}
                width={100}
                height={100}
                priority={true}
                className='rounded-full'
              />
              {profile && (
                <div className='flex flex-col gap-1'>
                  <h1 className='text-lg font-semibold'>{profile.name}</h1>
                  <span>
                    User since: {dayjs(profile.createdAt).format('DD MMM YYYY')}
                  </span>
                  {profile.team?.name && (
                    <Link
                      href={`/team/${profile.team.id}`}
                      className='flex items-center gap-1 text-slate-300 transition-colors hover:text-sky-400'
                    >
                      <span>{profile.team.name}</span>
                      <LinkIcon className='h-4' />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Tile>
          <Tile isLoading={isLoading}>
            {profile && (
              <div className='flex h-full flex-col justify-center gap-2'>
                <h1 className='text-lg font-semibold'>User statistics</h1>
                <div className='flex flex-col sm:grid sm:grid-cols-2 sm:gap-y-1 md:grid-cols-3'>
                  <div>
                    Race starts:
                    <span className='font-semibold text-sky-400'>
                      {' '}
                      {raceStarts}
                    </span>
                  </div>
                  <div>
                    Wins:
                    <span className='font-semibold text-sky-400'> {wins}</span>
                  </div>
                  <div>
                    Podiums:
                    <span className='font-semibold text-sky-400'>
                      {' '}
                      {podiums}
                    </span>
                  </div>
                  <div>
                    Poles:
                    <span className='font-semibold text-sky-400'>
                      {' '}
                      {polePositions}
                    </span>
                  </div>
                  <div>
                    DNFs:
                    <span className='font-semibold text-sky-400'> {DNFs}</span>
                  </div>
                </div>
              </div>
            )}
          </Tile>
          <Tile
            className='md:col-span-2 xl:col-span-3'
            header={
              <div className='flex items-center gap-2'>
                <CalendarDaysIcon className='h-6' />
                <h1 className='text-lg font-semibold'>Events</h1>
              </div>
            }
            isLoading={isLoading}
            fixedHeader
          >
            <div className='grid grid-cols-[repeat(auto-fit,_min(100%,_22rem))] justify-center gap-4'>
              {profile?.events.map(event => (
                <Event
                  key={event.id}
                  event={event}
                  profileId={userId as string}
                />
              ))}
              {profile?.events.length === 0 && !isLoading && (
                <span className='text-slate-300'>There are no events</span>
              )}
            </div>
          </Tile>
        </div>
      </main>
    </>
  );
};

type Event = NonNullable<Profile>['events'][number];

const Event: FC<{ event: Event; profileId: string }> = ({
  event,
  profileId,
}) => {
  const { data: session } = useSession();

  const { open: openDeleteEvent } = useEventStore();
  const { open: openPostResult } = useResultStore();
  const { open: openEditEvent } = useEditEventStore();

  const [notesOpened, setNotesOpened] = useState(false);

  const Dxx = useMemo(() => {
    const { result } = event;
    if (!result) return false;
    return result.DNF || result.DNS || result.DSQ;
  }, [event]);

  const isUserProfile = useMemo(
    () => session?.user?.id === profileId,
    [profileId, session?.user?.id]
  );

  const isTeamEvent = useMemo(() => Boolean(event.team), [event.team]);

  const eventTitle = useMemo(() => {
    const { championship } = event;
    let title = '';
    if (championship) {
      title += `${capitilize(championship.name)} - `;
    }
    title += event.title ?? '';
    return title;
  }, [event]);

  return (
    <Tile
      header={
        <div className='flex w-full items-center justify-between gap-2 rounded bg-slate-700'>
          <span className='truncate text-base font-semibold' title={eventTitle}>
            {eventTitle}
          </span>
          {!isTeamEvent && isUserProfile && !event.result && (
            <Button
              intent='danger'
              size='xs'
              gap='small'
              className='ml-auto p-1'
              aria-label='delete event'
              onClick={() =>
                openDeleteEvent(
                  event.id,
                  event.championship?.name,
                  event.title ?? undefined
                )
              }
            >
              <TrashIcon className='h-4' />
            </Button>
          )}
          {!isTeamEvent &&
            isUserProfile &&
            event.drivers.find(driver => driver.id === session?.user?.id) &&
            !event.result && (
              <Button
                intent='secondary'
                size='xs'
                gap='small'
                className='p-1'
                aria-label='edit event'
                onClick={() => openEditEvent(event)}
              >
                <PencilSquareIcon className='h-4' />
              </Button>
            )}
        </div>
      }
      className='relative h-72'
    >
      <AnimatePresence>
        {notesOpened && (
          <>
            <motion.div
              className='absolute top-0 left-0 z-10 h-full w-full bg-black/50 backdrop-blur-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <motion.button
              className='absolute top-4 left-4 z-10 flex items-center gap-1 transition-colors hover:text-sky-400'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setNotesOpened(false)}
            >
              <ArrowLeftIcon className='h-5' />
              <span>back</span>
            </motion.button>
            <motion.div
              className='absolute z-10 h-52 w-[calc(100%_-_2rem)] overflow-auto pr-4 text-slate-100 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {event.result?.notes}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div
        className={cn('mb-4 grid grid-cols-2 gap-y-4', {
          hidden: notesOpened,
        })}
      >
        <div className='flex flex-col'>
          <span className='text-slate-300'>Track</span>
          <span>{event.track}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Duration</span>
          <EventDuration duration={event.duration} />
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Date</span>
          <span>{dayjs(event.date).format('DD MMM YYYY')}</span>
        </div>
        {event.result && (
          <>
            <div className='flex flex-col'>
              <span className='text-slate-300'>Quali Position</span>
              <span>
                {Dxx ? '-' : `P${event.result.qualiPosition as number}`}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-slate-300'>Race Position</span>
              <span>
                {event.result.DNF
                  ? 'DNF'
                  : event.result.DNS
                  ? 'DNS'
                  : event.result.DSQ
                  ? 'DSQ'
                  : `P${event.result.racePosition as number}`}
              </span>
            </div>
            {event.result.notes && (
              <div className='flex flex-col'>
                <button
                  className='flex items-center gap-1 text-slate-300 transition-colors hover:text-sky-400'
                  title='Read more'
                  onClick={() => setNotesOpened(true)}
                >
                  <span>Notes</span>
                  <EllipsisHorizontalCircleIcon className='h-5' />
                </button>
                <span className='truncate'>{event.result.notes}</span>
              </div>
            )}
          </>
        )}
      </div>
      {dayjs().isAfter(dayjs(event.date)) &&
        !event.result &&
        isUserProfile &&
        !isTeamEvent && (
          <Button
            intent='secondary'
            size='small'
            className='font-semibold'
            onClick={() =>
              openPostResult({
                id: event.id,
                title: event.title ?? 'event',
              })
            }
          >
            <span>Post result</span>
            <DocumentArrowUpIcon className='h-5' />
          </Button>
        )}
    </Tile>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default Profile;

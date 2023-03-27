import PostResult from '@dashboard/results/PostResult';
import { Disclosure } from '@headlessui/react';
import {
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ChevronUpIcon,
  DocumentArrowUpIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/20/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import Button from '@ui/Button';
import Loading from '@ui/Loading';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { type GetServerSideProps, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { useMemo, useState, type FC } from 'react';
import Navbar from '../../components/Navbar';
import PostChampResult from '../../components/dashboard/results/PostChampResult';
import { useError } from '../../hooks/useError';
import cn from '../../lib/classes';
import { getServerAuthSession } from '../../server/auth';
import { useChampResultStore } from '../../store/useChampResultStore';
import { useResultStore } from '../../store/useResultStore';
import { api, type RouterOutputs } from '../../utils/api';
import { capitilize } from '../../utils/helpers';
import EventDuration from '../../components/EventDuration';
import Settings from '../../components/Settings';
import DriverList from '../../components/DriverList';

const AllChampionships: NextPage = () => {
  const { Error, setError } = useError();

  const { data: championships, isLoading: getChampsLoading } =
    api.championship.get.useQuery(
      { max: 0, upcoming: false },
      { onError: err => setError(err.message) }
    );

  const unarchivedChampionships = useMemo(
    () => championships?.filter(championship => !championship.archived),
    [championships]
  );

  const archivedChampionships = useMemo(
    () => championships?.filter(championship => championship.archived),
    [championships]
  );

  return (
    <>
      <NextSeo title='All championships' />
      <Navbar />
      <main className='min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <PostResult />
        <PostChampResult />
        <Settings />
        <Link
          href='/'
          className='flex items-center gap-2 pl-4 pt-4 text-slate-300 transition-colors hover:text-sky-400'
        >
          <ChevronLeftIcon className='h-5' />
          <span className='text-base font-normal'>back</span>
        </Link>
        <Error />
        {getChampsLoading && (
          <div className='flex h-screen w-full items-center justify-center'>
            <Loading />
          </div>
        )}
        <h1 className='pt-4 pb-8 text-center text-2xl font-semibold sm:text-3xl'>
          All Championships
        </h1>
        <div className='flex flex-col gap-4 px-4'>
          {unarchivedChampionships?.map(championship => (
            <Championship key={championship.id} championship={championship} />
          ))}
        </div>
        {archivedChampionships && archivedChampionships.length > 0 && (
          <>
            <div className='mt-8 mb-6 ml-4 h-[1px] w-[calc(100%_-_2rem)] bg-slate-800 sm:mb-7' />
            <h2 className='mb-2 pl-4 text-base font-semibold sm:text-lg'>
              Archived championships
            </h2>
            <div className='flex flex-col gap-4 px-4 pb-4'>
              {archivedChampionships.map(championship => (
                <Championship
                  key={championship.id}
                  championship={championship}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
};

const Championship: FC<{
  championship: RouterOutputs['championship']['get'][number];
}> = ({ championship }) => {
  const { open: openPostResult } = useChampResultStore();

  const { Error, setError } = useError();

  const everyEventHasResult = useMemo(
    () => championship.events.every(event => event.result),
    [championship.events]
  );

  const utils = api.useContext();
  const { mutate: manipulateArchive, isLoading } =
    api.championship.archive.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.championship.invalidate();
      },
    });

  return (
    <Disclosure key={championship.id}>
      {({ open }) => (
        <>
          <Disclosure.Button className='flex w-full items-center gap-2 rounded bg-slate-800 px-4 py-2 text-left text-lg font-semibold text-slate-50 ring-1 ring-slate-700 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75 hover:bg-slate-700'>
            <ChevronUpIcon
              className={cn('h-5 w-5 text-sky-400 transition-transform', {
                'rotate-180 transform': open,
              })}
            />
            <span
              className={cn({
                truncate: !open,
              })}
              title={`${championship.organizer} - ${championship.name}`}
            >
              {championship.organizer} - {championship.name}
            </span>
          </Disclosure.Button>
          <Disclosure.Panel className='px-4'>
            <div className='flex w-full flex-col gap-4'>
              <a
                href={championship.link}
                className='group flex items-center gap-2 self-start font-semibold transition-colors hover:text-sky-400'
                target='_blank'
                rel='noreferrer'
              >
                <span>Championship website</span>
                <ArrowTopRightOnSquareIcon className='h-5 text-slate-300 transition-colors group-hover:text-sky-400' />
              </a>
              <div className='relative grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Car</span>
                  <span className='text-slate-50'>
                    {capitilize(
                      championship.car === '' || !championship.car
                        ? '-'
                        : championship.car
                    )}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Type</span>
                  <span className='text-slate-50'>
                    {capitilize(championship.type)}
                  </span>
                </div>
                {championship.result && (
                  <div className='flex flex-col'>
                    <span className='text-slate-300'>
                      Championship position
                    </span>
                    <span className='text-slate-50'>
                      P{championship.result.position}
                    </span>
                  </div>
                )}
              </div>
              <div>
                {dayjs().isAfter(
                  dayjs(
                    championship.events[championship.events.length - 1]?.date
                  )
                ) &&
                  !championship.result && (
                    <>
                      <Button
                        intent={!championship.result ? 'primary' : 'secondary'}
                        size='small'
                        className='mt-2 font-semibold'
                        disabled={!everyEventHasResult}
                        onClick={() => {
                          const { id, organizer, name } = championship;
                          openPostResult({
                            id,
                            organizer,
                            title: name,
                          });
                        }}
                      >
                        <span>Post result</span>
                        <DocumentArrowUpIcon className='h-5' />
                      </Button>
                      {!everyEventHasResult && (
                        <span className='mt-3 block text-sm text-slate-400'>
                          Note: Post a result for every event in this
                          championship first in order to post a result for the
                          championship
                        </span>
                      )}
                    </>
                  )}
                {championship.result && (
                  <Button
                    intent='primary'
                    size='small'
                    className='mt-2 font-semibold'
                    disabled={isLoading}
                    onClick={() => {
                      manipulateArchive({
                        championshipId: championship.id,
                        moveToArchive: !championship.archived,
                      });
                    }}
                  >
                    <span>
                      {championship.archived ? 'Restore from ' : 'Move to '}
                      archive
                    </span>
                    {isLoading ? (
                      <Loading />
                    ) : championship.archived ? (
                      <ArchiveBoxXMarkIcon className='h-5' />
                    ) : (
                      <ArchiveBoxArrowDownIcon className='h-5' />
                    )}
                  </Button>
                )}
                <Error />
              </div>
              <div className='border-t border-slate-800 pt-4'>
                <h3 className='mb-4 text-xl font-semibold'>Events</h3>
                {championship.events.length > 0 ? (
                  <div className='flex w-full flex-wrap gap-4'>
                    {championship.events.map(event => (
                      <Event key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <span className='text-slate-300'>
                    There are no events for this championship
                  </span>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

const Event: FC<{
  event: RouterOutputs['championship']['get'][number]['events'][number];
}> = ({ event }) => {
  const { open } = useResultStore();
  const [resultsOpened, setResultsOpened] = useState(false);

  const Dxx = useMemo(() => {
    if (!event.result) return false;
    const { DNF, DNS, DSQ } = event.result;
    return DNF || DNS || DSQ;
  }, [event.result]);

  return (
    <div className='relative flex w-full max-w-xs flex-col gap-2 rounded bg-slate-800 p-4 ring-1 ring-slate-700'>
      <AnimatePresence>
        {resultsOpened && (
          <>
            <motion.div
              className='absolute top-0 left-0 z-10 h-full w-full rounded bg-black/50 backdrop-blur-sm'
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
              onClick={() => setResultsOpened(false)}
            >
              <ArrowLeftIcon className='h-5' />
              <span>back</span>
            </motion.button>
            <motion.div
              className='absolute top-12 z-10 flex max-h-full w-[calc(100%_-_1.5rem)] flex-col gap-4 text-slate-100'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className='flex flex-col'>
                <span className='text-slate-300'>Qualifying position</span>
                <span>
                  {Dxx ? '-' : `P${event.result?.qualiPosition as number}`}
                </span>
              </div>
              <div className='flex flex-col'>
                <span className='text-slate-300'>Race position</span>
                <span>
                  {event.result?.DNF
                    ? 'DNF'
                    : event.result?.DNS
                    ? 'DNS'
                    : event.result?.DSQ
                    ? 'DSQ'
                    : `P${event.result?.racePosition as number}`}
                </span>
              </div>
              {event.result?.notes && (
                <div className='flex flex-col'>
                  <span className='text-slate-300'>Notes</span>
                  <span className='block max-h-48 overflow-y-scroll scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'>
                    {event.result.notes}
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <span className='self-center text-xl font-semibold'>{event.title}</span>
      <div className='flex flex-col'>
        <span className='text-slate-300'>Date</span>
        <span>{dayjs(event.date).format('DD MMM YYYY HH:mm')}</span>
      </div>
      <div className='flex flex-col'>
        <span className='text-slate-300'>Car</span>
        <span>{event.car}</span>
      </div>
      <div className='flex flex-col'>
        <span className='text-slate-300'>Track</span>
        <span>{event.track}</span>
      </div>
      <div className='flex flex-col'>
        <span className='text-slate-300'>Duration</span>
        <EventDuration duration={event.duration} />
      </div>
      <div className='flex flex-col'>
        <span className='text-slate-300'>Drivers</span>
        <span>
          <DriverList drivers={event.drivers} />
        </span>
      </div>
      {dayjs().isAfter(dayjs(event.date)) && (
        <Button
          intent={!event.result ? 'primary' : 'secondary'}
          size='small'
          fullWidth
          className='mt-2 font-semibold'
          onClick={() => {
            if (!event.result) {
              return open({ id: event.id, title: event.title ?? 'event' });
            }
            setResultsOpened(true);
          }}
        >
          {!event.result ? (
            <>
              <span>Post result</span>
              <DocumentArrowUpIcon className='h-5' />
            </>
          ) : (
            <>
              <span>Show result</span>
              <DocumentChartBarIcon className='h-5' />
            </>
          )}
        </Button>
      )}
    </div>
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

export default AllChampionships;

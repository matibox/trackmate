import { useSession } from 'next-auth/react';
import { type FC, useMemo, useState } from 'react';
import { type RouterOutputs } from '~/utils/api';
import { useEventStore } from '../dashboard/events/store';
import { capitilize } from '~/utils/helpers';
import Tile from '@ui/Tile';
import Button from '@ui/Button';
import {
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalCircleIcon,
  DocumentArrowUpIcon,
  ArrowLeftIcon,
} from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from 'framer-motion';
import cn from '~/lib/classes';
import EventDuration from '~/components/common/EventDuration';
import dayjs from 'dayjs';
import { ForwardIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Profile = RouterOutputs['user']['getProfile'];
type Event = NonNullable<Profile>['events'][number];

const Event: FC<{ event: Event; profileId: string; upcoming: boolean }> = ({
  event,
  profileId,
  upcoming,
}) => {
  const { data: session } = useSession();

  const {
    delete: { open: openDeleteEvent },
    edit: { open: openEditEvent },
    result: { open: openPostResult },
  } = useEventStore();

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

  const canAccessEventPage = useMemo(() => {
    if (!session?.user?.id) return false;
    return [
      event.managerId,
      ...event.drivers.map(driver => driver.id),
    ].includes(session?.user?.id);
  }, [event.drivers, event.managerId, session?.user?.id]);

  return (
    <Tile
      header={
        <div className='flex w-full items-center justify-between gap-2 rounded bg-slate-700'>
          {canAccessEventPage ? (
            <Link
              href={`/event/${event.id}`}
              className='flex items-center gap-1.5 font-semibold underline decoration-slate-500 underline-offset-2 transition-colors hover:decoration-slate-50'
              title={eventTitle}
            >
              {upcoming && (
                <ForwardIcon title='upcoming event' className='h-5' />
              )}
              <span className='truncate text-base'>{eventTitle}</span>
            </Link>
          ) : (
            <div
              className='flex items-center gap-1.5 font-semibold'
              title={eventTitle}
            >
              {upcoming && (
                <ForwardIcon title='upcoming event' className='h-5' />
              )}
              <span className='truncate text-base'>{eventTitle}</span>
            </div>
          )}
          {!isTeamEvent && isUserProfile && !event.result && (
            <Button
              intent='danger'
              size='xs'
              gap='small'
              className='ml-auto p-1'
              aria-label='delete event'
              onClick={() =>
                openDeleteEvent({
                  id: event.id,
                  championship: event.championship,
                  title: event.title,
                })
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

export default Event;

import {
  TrashIcon,
  DocumentArrowUpIcon,
  EllipsisHorizontalCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
} from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useMemo, useState, type FC } from 'react';
import { useEventStore } from '../../../store/useEventStore';
import { useResultStore } from '../../../store/useResultStore';
import { type RouterOutputs } from '../../../utils/api';
import { capitilize } from '../../../utils/helpers';
import cn from '../../../lib/classes';
import { useSession } from 'next-auth/react';
import { useEditEventStore } from '../../../store/useEditEventStore';

type EventProps = {
  event: RouterOutputs['event']['getDrivingEvents'][number];
  isTeamEvent?: boolean;
};

const Event: FC<EventProps> = ({ event, isTeamEvent = false }) => {
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

  return (
    <Tile
      header={
        <div className='flex w-full items-center justify-between gap-2 rounded bg-slate-700'>
          <span className='text-base font-semibold'>
            {event.championship && (
              <>{capitilize(event.championship.name)} - </>
            )}
            {capitilize(event.title ?? '')}
          </span>
          {!isTeamEvent && !event.result && (
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
      className='relative'
    >
      <div
        className={cn('mb-4 grid grid-cols-2 gap-y-4 sm:grid-cols-3', {
          hidden: notesOpened,
        })}
      >
        <div className='flex flex-col'>
          <span className='text-slate-300'>Car</span>
          <span>{event.car}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Track</span>
          <span>{event.track}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Type</span>
          <span>{capitilize(event.type)}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Duration</span>
          <span>{event.duration} minutes</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Start at</span>
          <span>{dayjs(event.date).format('HH:mm')}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Drivers</span>
          <span>{event.drivers.map(driver => driver.name).join(', ')}</span>
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
      {dayjs().isAfter(dayjs(event.date)) && !event.result && !isTeamEvent && (
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
      {notesOpened && (
        <>
          <motion.div
            className='absolute top-0 left-0 h-full w-full bg-black/50 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.button
            className='absolute top-4 left-4 flex items-center gap-1 transition-colors hover:text-sky-400'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            onClick={() => setNotesOpened(false)}
          >
            <ArrowLeftIcon className='h-5' />
            <span>back</span>
          </motion.button>
          <motion.div
            className='relative h-full w-full text-slate-100'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {event.result?.notes}
          </motion.div>
        </>
      )}
    </Tile>
  );
};

export default Event;

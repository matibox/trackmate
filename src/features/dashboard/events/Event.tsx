import {
  TrashIcon,
  DocumentArrowUpIcon,
  EllipsisHorizontalCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useMemo, useState, type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import { capitilize } from '~/utils/helpers';
import { useSession } from 'next-auth/react';
import { useEventStore } from './store';
import EventDuration from '~/components/common/EventDuration';
import DriverList from '~/components/common/DriverList';
import Details from '~/components/common/Details';
import Link from 'next/link';

type EventProps = {
  event: RouterOutputs['event']['getDrivingEvents'][number];
  isTeamEvent?: boolean;
};

const Event: FC<EventProps> = ({ event, isTeamEvent = false }) => {
  const { data: session } = useSession();

  const {
    delete: { open: openDeleteEvent },
    edit: { open: openEditEvent },
    setups: { open: openEventSetups },
    result: { open: openPostResult },
  } = useEventStore();

  const [notesOpened, setNotesOpened] = useState(false);

  const Dxx = useMemo(() => {
    const { result } = event;
    if (!result) return false;
    return result.DNF || result.DNS || result.DSQ;
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
              className='mr-auto text-base font-semibold underline decoration-slate-500 underline-offset-2 transition-colors hover:decoration-slate-50'
            >
              {event.championship && (
                <>{capitilize(event.championship.name)} - </>
              )}
              {capitilize(event.title ?? '')}
            </Link>
          ) : (
            <span className='mr-auto text-base font-semibold'>
              {event.championship && (
                <>{capitilize(event.championship.name)} - </>
              )}
              {capitilize(event.title ?? '')}
            </span>
          )}
          {!isTeamEvent && (
            <Button
              intent='secondary'
              size='xs'
              gap='small'
              className='p-1'
              aria-label='Open event setups'
              title='Setups'
              onClick={() =>
                openEventSetups({
                  id: event.id,
                  championship: event.championship,
                  title: event.title,
                  result: event.result,
                })
              }
            >
              <WrenchScrewdriverIcon className='h-4' />
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
                aria-label='Edit event'
                title='Edit'
                onClick={() => openEditEvent(event)}
              >
                <PencilSquareIcon className='h-4' />
              </Button>
            )}
          {!isTeamEvent && !event.result && (
            <Button
              intent='subtleDanger'
              size='xs'
              gap='small'
              className='p-1'
              aria-label='Delete event'
              title='Delete'
              onClick={() =>
                openDeleteEvent({
                  id: event.id,
                  title: event.title,
                  championship: event.championship,
                })
              }
            >
              <TrashIcon className='h-4' />
            </Button>
          )}
        </div>
      }
      className='relative'
    >
      <Details
        details={[
          { label: 'Car', value: event.car },
          { label: 'Track', value: event.track },
          { label: 'Type', value: capitilize(event.type) },
          {
            label: 'Duration',
            value: <EventDuration duration={event.duration} />,
          },
          { label: 'Start at', value: dayjs(event.date).format('HH:mm') },
          { label: 'Drivers', value: <DriverList drivers={event.drivers} /> },
          {
            condition: Boolean(event.result),
            label: 'Quali Position',
            value: Dxx ? '-' : `P${event.result?.qualiPosition as number}`,
          },
          {
            condition: Boolean(event.result),
            label: 'Race Position',
            value: event.result?.DNF
              ? 'DNF'
              : event.result?.DNS
              ? 'DNS'
              : event.result?.DSQ
              ? 'DSQ'
              : `P${event.result?.racePosition as number}`,
          },
        ]}
        className='mb-4 sm:grid-cols-3'
      >
        {event.result && event.result.notes && (
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
      </Details>
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
            className='absolute top-12 left-4 h-full w-[calc(100%_-_2rem)] overflow-y-auto pr-4 text-slate-100 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'
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

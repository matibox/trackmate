import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState, type FC } from 'react';
import EventDuration from '~/components/common/EventDuration';
import DriverList from '~/components/common/DriverList';
import { useEventStore } from '~/features/dashboard/events/store';
import { type RouterOutputs } from '~/utils/api';

const Event: FC<{
  event: RouterOutputs['championship']['get'][number]['events'][number];
}> = ({ event }) => {
  const { open } = useEventStore().result;
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

export default Event;

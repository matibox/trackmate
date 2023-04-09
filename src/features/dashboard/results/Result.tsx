import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState, type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import DriverList from '~/components/common/DriverList';
import Details from '~/components/common/Details';

type ResultProps = {
  result: RouterOutputs['result']['getResultPage'][number];
};

const Result: FC<ResultProps> = ({ result }) => {
  const [notesOpened, setNotesOpened] = useState(false);

  const Dxx = useMemo(() => {
    return result.DNF || result.DNS || result.DSQ;
  }, [result.DNF, result.DNS, result.DSQ]);

  return (
    <Tile
      header={
        <div className='flex w-full items-center justify-between'>
          <span
            className='truncate text-lg font-semibold'
            title={`${
              result.event.championship?.name
                ? result.event.championship.name + ' -'
                : ''
            } ${result.event.title ?? 'Event'}`}
          >
            {result.event.championship ? (
              <>
                {result.event.championship.name} - {result.event.title}
              </>
            ) : (
              <>{result.event.title}</>
            )}
          </span>
        </div>
      }
      className='relative w-96'
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
              className='absolute z-10 h-80 w-[calc(100%_-_2rem)] overflow-auto pr-4 text-slate-100 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {result.notes}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Details
        details={[
          { label: 'Created by', value: result.author.name },
          {
            label: 'Created at',
            value: dayjs(result.createdAt).format('DD MMM HH:mm'),
          },
          {
            label: 'Event occurence',
            value: dayjs(result.event.date).format('YYYY MMM DD'),
          },
          { label: 'Track', value: result.event.track },
          {
            label: 'Drivers',
            value: <DriverList drivers={result.event.drivers} />,
            span: 2,
          },
        ]}
        className='border-b border-slate-700 pb-4'
      />
      <div className='grid-cols-w grid gap-4 pt-4'>
        <h2 className='col-span-2 text-lg font-semibold'>Result</h2>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Qualifying</span>
          {Dxx ? '-' : `P${result.qualiPosition as number}`}
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Race</span>
          {result.DNF
            ? 'DNF'
            : result.DNS
            ? 'DNS'
            : result.DSQ
            ? 'DSQ'
            : `P${result.racePosition as number}`}
        </div>
      </div>
      {result.notes && (
        <Button
          intent='secondary'
          size='small'
          className='mt-4'
          onClick={() => setNotesOpened(true)}
        >
          <span>Read notes</span>
          <DocumentTextIcon className='h-5' />
        </Button>
      )}
    </Tile>
  );
};

export default Result;

import { PlusIcon } from '@heroicons/react/24/outline';
import { Fragment, type FC } from 'react';
import { useStints } from './hooks/useStints';
import AddStint from './popups/AddStint';
import {
  useAddStintStore,
  useDeleteStintStore,
  useFinishStintStore,
} from './store';
import { useEventQuery } from './hooks/useEventQuery';
import dayjs from 'dayjs';
import Avatar from '~/components/common/Avatar';
import DriverList from '~/components/common/DriverList';
import Details from '~/components/common/Details';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import DeleteStint from './popups/DeleteStint';
import FinishStint from './popups/FinishStint';

const Stints: FC = () => {
  const { stints } = useEventQuery();
  const { totalDuration: duration } = useStints();
  const { open: openAddStint } = useAddStintStore();
  const { open: openDeleteStint } = useDeleteStintStore();
  const { open: openFinishStint } = useFinishStintStore();

  return (
    <>
      <AddStint />
      <DeleteStint />
      <FinishStint />
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          {stints.map((stint, i) => (
            <Fragment key={stint.id}>
              <div className='flex max-w-2xl flex-col gap-3 rounded p-2 ring-1 ring-slate-800'>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <Avatar
                      src={stint.driver.image ?? ''}
                      alt={`${stint.driver.name ?? 'driver'}'s profile picture`}
                      width={30}
                      height={30}
                      className='rounded-full'
                    />
                    <DriverList drivers={[stint.driver]} />
                    {!stint.ended && i === stints.length - 1 ? (
                      <Button
                        intent='subtleDanger'
                        size='xs'
                        gap='small'
                        className='ml-auto h-6 p-1'
                        aria-label='Delete stint'
                        title='Delete stint'
                        onClick={() => openDeleteStint(stint.id)}
                      >
                        <TrashIcon className='h-4' />
                      </Button>
                    ) : null}
                  </div>
                  <div>
                    <Details
                      details={[
                        {
                          label: 'Start',
                          value: dayjs(stint.start).format('HH:mm'),
                        },
                        {
                          label: 'Estimated end',
                          value: dayjs(stint.estimatedEnd).format('HH:mm'),
                          condition: !stint.duration,
                        },
                        {
                          label: 'End',
                          value: dayjs(stint.start)
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            .add(stint.duration!, 'minutes')
                            .format('HH:mm'),
                          condition: !!stint.duration,
                        },
                      ]}
                    />
                  </div>
                </div>
                {!stint.ended &&
                stints.slice(0, i).filter(s => !s.ended).length === 0 ? (
                  <Button
                    intent='secondary'
                    size='small'
                    gap='small'
                    className='self-start'
                    onClick={() =>
                      openFinishStint({ id: stint.id, start: stint.start })
                    }
                  >
                    Finish stint
                  </Button>
                ) : null}
              </div>
              {stints.length > 1 &&
              i !== stints.length - 1 &&
              (!stint.ended || !stints[i + 1]?.ended) ? (
                <button
                  className='group flex max-w-2xl items-center gap-3'
                  title='Add a stint between these 2 stints'
                  aria-label='Add a stint between these 2 stints'
                  onClick={() => {
                    const { duration, start, estimatedEnd } = stint;
                    openAddStint({
                      after: duration
                        ? dayjs(start).add(duration, 'minutes').toDate()
                        : estimatedEnd,
                      nextStintId: stints[i + 1]?.id,
                    });
                  }}
                >
                  <div className='h-[1px] grow bg-slate-800' />
                  <div>
                    <PlusCircleIcon className='h-5 text-slate-300 transition-colors group-hover:text-sky-400' />
                  </div>
                  <div className='h-[1px] grow bg-slate-800' />
                </button>
              ) : null}
            </Fragment>
          ))}
        </div>
        <button
          className='flex h-8 max-w-2xl items-center justify-center rounded px-2 py-1 text-slate-300 ring-1 ring-slate-800 transition hover:bg-slate-800 hover:ring-slate-700'
          title='Add new stint'
          aria-label='Add new stint'
          onClick={() => openAddStint()}
        >
          <PlusIcon className='h-[22px]' />
        </button>
        <h2>
          Event duration: <span className='font-semibold'>{duration}</span>
        </h2>
      </div>
    </>
  );
};

export default Stints;

import { Disclosure } from '@headlessui/react';
import {
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  ArrowTopRightOnSquareIcon,
  ChevronUpIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Loading from '@ui/Loading';
import dayjs from 'dayjs';
import { useMemo, type FC } from 'react';
import { useError } from '~/hooks/useError';
import cn from '~/lib/classes';
import { api, type RouterOutputs } from '~/utils/api';
import { capitilize } from '~/utils/helpers';
import Event from './Event';
import { useChampResultStore, useEditRosterStore } from './store';
import Details from '~/components/common/Details';
import DriverList from '~/components/common/DriverList';
import { TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useChampionshipStore } from '../dashboard/championships/store';

const Championship: FC<{
  championship: RouterOutputs['championship']['get'][number];
}> = ({ championship }) => {
  const { open: openPostResult } = useChampResultStore();
  const { open: openEditRoster } = useEditRosterStore();
  const {
    delete: { open: openDeleteChamp },
  } = useChampionshipStore();

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
                <div className='flex flex-col gap-4'>
                  <Details
                    details={[
                      {
                        label: 'Car',
                        value: capitilize(
                          championship.car === '' || !championship.car
                            ? '-'
                            : championship.car
                        ),
                      },
                      { label: 'Type', value: capitilize(championship.type) },
                      {
                        label: 'Roster',
                        value: <DriverList drivers={championship.drivers} />,
                        span: 2,
                      },
                    ]}
                  />
                  <div className='flex gap-2'>
                    {!championship.archived ? (
                      <Button
                        intent='secondary'
                        size='small'
                        gap='small'
                        onClick={() =>
                          openEditRoster({
                            id: championship.id,
                            title: championship.name,
                            organizer: championship.organizer,
                            roster: championship.drivers,
                          })
                        }
                      >
                        <span>Edit roster</span>
                        <UsersIcon className='h-5' />
                      </Button>
                    ) : null}
                    <Button
                      intent='danger'
                      size='small'
                      gap='small'
                      onClick={() =>
                        openDeleteChamp(championship.id, championship.name)
                      }
                    >
                      <span>Delete championship</span>
                      <TrashIcon className='h-5' />
                    </Button>
                  </div>
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

export default Championship;

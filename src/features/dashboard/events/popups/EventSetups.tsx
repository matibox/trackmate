import Popup, { PopupHeader } from '~/components/common/Popup';
import {
  useState,
  type FC,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';
import Input from '@ui/Input';
import useDebounce from '~/hooks/useDebounce';
import { type RouterOutputs, api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import {
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import { PlusIcon } from '@heroicons/react/20/solid';
import cn from '~/lib/classes';
import Tile from '@ui/Tile';
import { type Variants, motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { useClickOutside } from '~/hooks/useClickOutside';
import useSetupDownload from '~/hooks/useJSONDownload';
import { useSession } from 'next-auth/react';
import { useEventStore } from '../store';
import DriverList from '~/components/common/DriverList';

const EventSetups: FC = () => {
  const {
    setups: { close, isOpened, event },
  } = useEventStore();

  const [assignOpen, setAssignOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);

  const { Error, setError } = useError();

  const { data: eventSetups, isLoading: eventSetupsLoading } =
    api.event.setups.useQuery(
      {
        eventId: event?.id,
      },
      {
        onError: err => setError(err.message),
      }
    );

  const { data: searchedSetups, isInitialLoading: searchedSetupsLoading } =
    api.setup.byQuery.useQuery(
      {
        eventId: event?.id,
        q: debouncedQuery,
      },
      {
        enabled: Boolean(debouncedQuery),
        onError: err => setError(err.message),
      }
    );

  return (
    <Popup
      close={close}
      condition={isOpened}
      isLoading={eventSetupsLoading || searchedSetupsLoading}
      header={
        <PopupHeader
          close={close}
          title={`Setups - ${event?.title ?? 'Event'}`}
        />
      }
      className='max-w-[44rem]'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex w-full'>
            <Error />
            <div className='flex max-h-96 flex-wrap gap-4 overflow-y-auto rounded p-[1px] scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'>
              {eventSetups?.map(setup => (
                <Setup
                  key={setup.id}
                  setup={setup}
                  setQuery={setQuery}
                  isAssigned
                />
              ))}
            </div>
            {eventSetups?.length === 0 && (
              <span className='text-slate-300'>
                There are no setups assigned for this event.
              </span>
            )}
          </div>
        </div>
        <div className='flex w-full flex-col gap-2 sm:flex-row'>
          <Button
            intent='primary'
            size='small'
            gap='small'
            className='self-start font-normal'
            onClick={() => setAssignOpen(prev => !prev)}
          >
            <span>{assignOpen ? 'Close' : 'Assign setup'}</span>
            <PlusIcon
              className={cn('h-5 transition-transform', {
                'rotate-45': assignOpen,
              })}
            />
          </Button>
          {assignOpen && (
            <div className='flex flex-col'>
              <div className='flex grow gap-4'>
                <label className='flex grow items-center gap-2 sm:grow-0'>
                  <MagnifyingGlassIcon className='h-5' />
                  <Input
                    className='h-7'
                    placeholder='Name, car, track or author'
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    error={undefined}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        {assignOpen && searchedSetups && (
          <div className='flex max-h-96 flex-wrap gap-4 overflow-y-auto rounded p-[1px] scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'>
            {searchedSetups.map(setup => (
              <Setup key={setup.id} setup={setup} setQuery={setQuery} />
            ))}
            {!searchedSetupsLoading && searchedSetups.length === 0 && (
              <span className='text-slate-300'>No setups found</span>
            )}
          </div>
        )}
      </div>
    </Popup>
  );
};

const menuAnimation: Variants = {
  start: { opacity: 0, x: '-100%', width: 0 },
  show: {
    opacity: 1,
    x: 0,
    width: '100%',
    transition: { bounce: 0, staggerChildren: 0.1, delayChildren: 0.2 },
  },
  end: { opacity: 0, y: '-100%', width: '100%', transition: { duration: 0.3 } },
};

const itemAnimation: Variants = {
  start: { opacity: 0 },
  show: { opacity: 1 },
  end: { opacity: 0 },
};

const Setup: FC<{
  setup: RouterOutputs['setup']['byQuery'][number];
  setQuery: Dispatch<SetStateAction<string>>;
  isAssigned?: boolean;
}> = ({ setup, setQuery, isAssigned: defaultIsAssigned = false }) => {
  const { id, car, createdAt, updatedAt, name, track, author } = setup;
  const {
    setups: { event },
  } = useEventStore();

  const { data: session } = useSession();

  const [actionsOpened, setActionsOpened] = useState(false);
  const [isAssigned, setIsAssigned] = useState(defaultIsAssigned);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const unassignBtnRef = useRef<HTMLButtonElement>(null);

  const isEdited = useMemo(
    () => !dayjs(createdAt).isSame(dayjs(updatedAt)),
    [createdAt, updatedAt]
  );

  const isAuthor = useMemo(
    () => session?.user?.id === setup.author.id,
    [session?.user?.id, setup.author.id]
  );

  useClickOutside(menuRef, () => setActionsOpened(false), [
    menuBtnRef,
    downloadBtnRef,
    unassignBtnRef,
  ]);

  const { Error, setError } = useError();
  const { download, isLoading: downloadLoading } = useSetupDownload(setError);

  const utils = api.useContext();
  const { mutate: toggleAssignment, isLoading: assignLoading } =
    api.setup.toggleAssignment.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.setups.invalidate();
        await utils.setup.invalidate();
        setIsAssigned(prev => !prev);
      },
    });

  return (
    <Tile
      header={
        <div className='flex justify-between'>
          <h1 className='font-semibold'>{name}</h1>
          {isAssigned ? (
            <>
              <motion.button
                aria-label={`${actionsOpened ? 'close' : 'open'} menu`}
                className='relative z-10 transition-colors hover:text-sky-400'
                onClick={() => setActionsOpened(prev => !prev)}
                animate={{
                  rotate: actionsOpened ? 90 : 0,
                }}
                ref={menuBtnRef}
              >
                <EllipsisHorizontalCircleIcon className='h-5' />
              </motion.button>
              <AnimatePresence>
                {actionsOpened && (
                  <motion.div
                    variants={menuAnimation}
                    initial='start'
                    animate='show'
                    exit='end'
                    className='absolute top-0 left-0 flex h-14 w-full items-center gap-2 rounded-t bg-slate-800 py-2 px-4'
                    ref={menuRef}
                  >
                    <motion.button
                      variants={itemAnimation}
                      className='underline decoration-slate-500 underline-offset-2 transition-colors hover:text-sky-400'
                      ref={downloadBtnRef}
                      onClick={() => void download(id, name)}
                    >
                      download
                    </motion.button>
                    {isAuthor && (
                      <>
                        <motion.div
                          variants={itemAnimation}
                          className='h-3/5 w-[1px] bg-slate-600'
                        />
                        <motion.button
                          variants={itemAnimation}
                          className='underline decoration-slate-500 underline-offset-2 transition-colors hover:text-red-400'
                          ref={unassignBtnRef}
                          onClick={() =>
                            toggleAssignment({
                              eventId: event?.id,
                              setupId: id,
                              assign: false,
                            })
                          }
                        >
                          unassign
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.button
              aria-label={
                isAssigned
                  ? 'remove setup from an event'
                  : 'assign setup to a event'
              }
              className='relative z-10 transition-colors hover:text-sky-400'
              onClick={() => {
                toggleAssignment({
                  eventId: event?.id,
                  setupId: id,
                  assign: true,
                });
                if (!isAssigned) setQuery('');
              }}
              disabled={assignLoading}
            >
              <CheckCircleIcon className='h-5' />
            </motion.button>
          )}
        </div>
      }
      isLoading={assignLoading || downloadLoading}
      className='w-80'
    >
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Car</span>
          <span>{car}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Track</span>
          <span>{track}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>
            {isEdited ? 'Edited' : 'Posted'} on
          </span>
          <span>{dayjs(updatedAt).format('DD MMM YYYY')}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Posted by</span>
          <span>
            <DriverList drivers={[author]} />
          </span>
        </div>
      </div>
      <Error />
    </Tile>
  );
};

export default EventSetups;

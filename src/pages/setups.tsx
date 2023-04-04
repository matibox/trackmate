import { PlusIcon } from '@heroicons/react/20/solid';
import {
  EllipsisHorizontalCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Loading from '@ui/Loading';
import Tile from '@ui/Tile';
import { type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import {
  useState,
  type FC,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { useError } from '../hooks/useError';
import { api, type RouterOutputs } from '../utils/api';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import { useClickOutside } from '../hooks/useClickOutside';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import DriverList from '../components/DriverList';
import useDebounce from '../hooks/useDebounce';
import { useSetupStore } from '../store/useSetupStore';

type Setups = RouterOutputs['setup']['getAll'];

function useQuery(query: string, setups: Setups | undefined) {
  const debouncedQuery = useDebounce(query);
  const [filteredSetups, setFilteredSetups] = useState(setups);

  const someIncludes = useCallback((items: string[], string: string) => {
    return items.some(item => item.includes(string));
  }, []);

  useEffect(() => {
    if (!setups) return;
    const q = debouncedQuery;
    setFilteredSetups(() =>
      setups.filter(setup => {
        const {
          author: { name: authorName },
          car,
          name,
          track,
        } = setup;
        return someIncludes([authorName ?? '', car, name, track], q);
      })
    );
  }, [someIncludes, debouncedQuery, setups]);

  return filteredSetups;
}

const YourSetups: NextPage = () => {
  const { Error, setError } = useError();
  const { data: setups, isLoading } = api.setup.getAll.useQuery(undefined, {
    onError: err => setError(err.message),
  });

  const {
    post: { open },
  } = useSetupStore();

  const [query, setQuery] = useState('');
  const filteredSetups = useQuery(query, setups);

  // TODO: setup sorting/filtering

  return (
    <>
      <NextSeo title='Your setups' />
      <main className='min-h-screen w-full bg-slate-900 px-4 pt-[var(--navbar-height)] text-slate-50'>
        <Error />
        {isLoading && (
          <div className='flex h-screen w-full items-center justify-center'>
            <Loading />
          </div>
        )}
        <h1 className='py-8 text-center text-2xl font-semibold sm:text-3xl'>
          Your Setups
        </h1>
        <div className='flex flex-col gap-4 md:flex-row'>
          <Tile className='md:basis-1/3 lg:basis-1/4 xl:basis-1/5'>
            <div className='flex w-full flex-col gap-4'>
              <label className='flex w-full items-center gap-2'>
                <MagnifyingGlassIcon className='h-5' />
                <Input
                  className='h-7'
                  placeholder='Name, car, track or author'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  error={undefined}
                />
              </label>
              <Button
                intent='primary'
                size='small'
                gap='small'
                className='mt-auto self-end'
                onClick={open}
              >
                <span>New setup</span>
                <PlusIcon className='h-5' />
              </Button>
            </div>
          </Tile>
          <Tile className='flex-1'>
            <div className='flex flex-wrap justify-center gap-4'>
              {filteredSetups?.map(setup => (
                <Setup key={setup.id} setup={setup} />
              ))}
              {filteredSetups?.length === 0 && !isLoading && (
                <span className='text-slate-300'>There are no setups</span>
              )}
            </div>
          </Tile>
        </div>
      </main>
    </>
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

const Setup: FC<{ setup: Setups[number] }> = ({ setup }) => {
  const { car, createdAt, updatedAt, name, track, author } = setup;
  const { data: session } = useSession();

  const [actionsOpened, setActionsOpened] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const previewBtnRef = useRef<HTMLButtonElement>(null);
  const removeBtnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    // TODO: actions handling
    alert('coming soon');
  };

  useClickOutside(menuRef, () => setActionsOpened(false), [
    menuBtnRef,
    editBtnRef,
    previewBtnRef,
    removeBtnRef,
  ]);

  const isEdited = useMemo(
    () => !dayjs(createdAt).isSame(dayjs(updatedAt)),
    [createdAt, updatedAt]
  );

  const isAuthor = useMemo(
    () => session?.user?.id === author.id,
    [author.id, session?.user?.id]
  );

  return (
    <Tile
      header={
        <div className='flex justify-between'>
          <h1 className='font-semibold'>{name}</h1>
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
                {isAuthor && (
                  <>
                    <motion.button
                      variants={itemAnimation}
                      className='underline decoration-slate-500 underline-offset-2 transition-colors hover:text-sky-400'
                      ref={editBtnRef}
                      onClick={handleClick}
                    >
                      edit
                    </motion.button>
                    <motion.div
                      variants={itemAnimation}
                      className='h-3/5 w-[1px] bg-slate-600'
                    />
                  </>
                )}
                <motion.button
                  variants={itemAnimation}
                  className='underline decoration-slate-500 underline-offset-2 transition-colors hover:text-sky-400'
                  ref={previewBtnRef}
                  onClick={handleClick}
                >
                  preview
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
                      ref={removeBtnRef}
                      onClick={handleClick}
                    >
                      remove
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
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
    </Tile>
  );
};

export default YourSetups;

import dayjs from 'dayjs';
import { type Variants, AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState, type FC, useRef, useMemo } from 'react';
import DriverList from '~/components/common/DriverList';
import { useClickOutside } from '~/hooks/useClickOutside';
import { useError } from '~/hooks/useError';
import useSetupDownload from '~/hooks/useJSONDownload';
import { type RouterOutputs } from '~/utils/api';
import { useSetupStore } from './store';
import { EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';

import Tile from '@ui/Tile';
import Details from '~/components/common/Details';

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

const Setup: FC<{ setup: RouterOutputs['setup']['byQuery'][number] }> = ({
  setup,
}) => {
  const { id, car, createdAt, updatedAt, name, track, author } = setup;
  const { data: session } = useSession();

  const [actionsOpened, setActionsOpened] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const downloadBtnRef = useRef<HTMLButtonElement>(null);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  useClickOutside(menuRef, () => setActionsOpened(false), [
    menuBtnRef,
    editBtnRef,
    downloadBtnRef,
    deleteBtnRef,
  ]);

  const { Error, setError } = useError();
  const { download, isLoading } = useSetupDownload(setError);

  const {
    edit: { open: openEdit },
    delete: { open: openDelete },
  } = useSetupStore();

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
                      onClick={() => openEdit(setup)}
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
                      ref={deleteBtnRef}
                      onClick={() => openDelete({ id, name })}
                    >
                      delete
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      className='w-full'
      isLoading={isLoading}
    >
      <Error />
      <Details
        details={[
          { label: 'Car', value: car },
          { label: 'Track', value: track },
          {
            label: `${isEdited ? 'Edited' : 'Posted'} on`,
            value: dayjs(updatedAt).format('DD MMM YYYY'),
          },
          { label: 'Posted by', value: <DriverList drivers={[author]} /> },
        ]}
      />
    </Tile>
  );
};

export default Setup;

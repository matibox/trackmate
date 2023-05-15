import Tile from '@ui/Tile';
import { type FC, useRef, useCallback } from 'react';
import { type Event } from '~/pages/event/[eventId]';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import dayjs from 'dayjs';
import {
  ArrowDownTrayIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import cn from '~/lib/classes';
import Details from '~/components/common/Details';
import DriverList from '~/components/common/DriverList';
import { useSetup } from '~/hooks/useSetup';
import { useEventSetupFeedbackStore } from '../store';
import { api } from '~/utils/api';
import { hasRole } from '~/utils/helpers';
import { useSession } from 'next-auth/react';

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

type SetupProps = {
  setup: Event['setups'][number];
  isAssigned: boolean;
  eventId: string;
  fullWidth?: boolean;
  feedback?: boolean;
};

const Setup: FC<SetupProps> = ({
  setup,
  eventId,
  isAssigned: defaultIsAssigned,
  fullWidth = false,
  feedback = false,
}) => {
  const { id, car, track, updatedAt, author, name } = setup;
  const { data: session } = useSession();

  const {
    isSetupFeedbackOpened,
    open: openFeedback,
    close: closeFeedback,
  } = useEventSetupFeedbackStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const {
    isEdited,
    isActive,
    isAssigned,
    isAuthor,
    changedSinceLastDownload,
    download,
    toggleIsActive,
    toggleAssignment,
    isLoading,
    actionsOpened,
    setActionsOpened,
    Error,
  } = useSetup({
    setup,
    refs: {
      menuRef,
      menuBtnRef,
    },
    isAssigned: defaultIsAssigned,
  });

  const utils = api.useContext();
  const invalidateFeedbackQuery = useCallback(async () => {
    await utils.setup.feedback.invalidate();
  }, [utils.setup.feedback]);

  return (
    <Tile
      header={
        <div className='flex items-center justify-between gap-1'>
          <h1
            className={cn('truncate font-semibold', {
              'mr-auto': isActive,
            })}
            title={name}
          >
            {name}
          </h1>
          <div className='flex items-center gap-0.5 border-r border-slate-600 pr-1'>
            {isActive && (
              <CheckCircleIcon
                className='h-5 text-sky-400'
                title='This setup is set as active'
              />
            )}
            {changedSinceLastDownload && (
              <ExclamationCircleIcon
                className='h-5 text-amber-400'
                title='The setup got updated after you last downloaded it'
              />
            )}
          </div>
          {isAssigned ? (
            <>
              <div className='flex items-center gap-1'>
                {feedback && !hasRole(session, 'manager') ? (
                  <button
                    className={cn('transition-colors hover:text-sky-400', {
                      'text-sky-400': isSetupFeedbackOpened(setup.id),
                    })}
                    aria-label={`${
                      isSetupFeedbackOpened(setup.id)
                        ? 'Close feedback'
                        : 'Open feedback'
                    }`}
                    title='Setup feedback'
                    onClick={() => {
                      if (isSetupFeedbackOpened(setup.id)) {
                        closeFeedback();
                      } else {
                        closeFeedback();
                        openFeedback(setup);
                        void invalidateFeedbackQuery();
                      }
                    }}
                  >
                    <ChatBubbleOvalLeftEllipsisIcon className='h-5' />
                  </button>
                ) : null}
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
              </div>
              <AnimatePresence>
                {actionsOpened && (
                  <motion.div
                    variants={menuAnimation}
                    initial='start'
                    animate='show'
                    exit='end'
                    className='absolute top-0 left-0 flex h-11 w-full items-center gap-2 rounded-t bg-slate-800 py-2 px-4'
                    ref={menuRef}
                  >
                    <motion.button
                      variants={itemAnimation}
                      className='underline decoration-slate-500 underline-offset-2 transition-colors hover:text-sky-400'
                      onClick={() =>
                        toggleIsActive({
                          eventId,
                          setupId: id,
                          setAsActive: !isActive,
                        })
                      }
                      disabled={isLoading}
                    >
                      set as {isActive ? 'in' : ''}active
                    </motion.button>
                    <motion.div
                      variants={itemAnimation}
                      className='h-3/5 w-[1px] bg-slate-600'
                    />
                    {isAuthor && (
                      <>
                        <motion.button
                          variants={itemAnimation}
                          className='underline decoration-slate-500 underline-offset-2 transition-colors hover:text-red-400'
                          onClick={() =>
                            toggleAssignment({
                              eventId,
                              setupId: id,
                              assign: false,
                            })
                          }
                          disabled={isLoading}
                        >
                          unassign
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
                      onClick={() => void download(id, name)}
                      aria-label='download setup'
                    >
                      <ArrowDownTrayIcon className='h-5' />
                    </motion.button>
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
                  eventId,
                  setupId: id,
                  assign: !isAssigned,
                });
              }}
              disabled={isLoading}
            >
              <CheckCircleIcon className='h-5' />
            </motion.button>
          )}
        </div>
      }
      isLoading={isLoading}
      smallHeaderPadding
      className={cn('w-80', {
        'w-full': fullWidth,
      })}
    >
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
      <Error />
    </Tile>
  );
};

export default Setup;

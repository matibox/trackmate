import { XMarkIcon } from '@heroicons/react/24/outline';
import Loading from '@ui/Loading';
import { AnimatePresence, motion } from 'framer-motion';
import { type RefObject, useRef, type FC, Fragment } from 'react';
import { useClickOutside } from '~/hooks/useClickOutside';
import { useError } from '~/hooks/useError';
import { useNotificationStore } from '~/store/useNotificationsStore';
import { api } from '~/utils/api';
import { objectEntries } from '~/utils/helpers';
import Notification from './Notification';

type NotificationsProps = {
  buttonRef: RefObject<HTMLButtonElement>;
};

const Notifications: FC<NotificationsProps> = ({ buttonRef }) => {
  const { isOpened, toggle, setUnread } = useNotificationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, toggle, [buttonRef]);

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { data, isLoading } = api.notification.getAll.useQuery(undefined, {
    onError: err => setError(err.message),
    refetchInterval: 1000 * 60 * 5,
    onSuccess: data => {
      if (data.isAllRead) {
        setUnread(false);
      } else {
        setUnread(true);
      }
    },
  });

  const { mutate: markAllAsRead } = api.notification.markAllAsRead.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.notification.getAll.invalidate();
    },
  });

  return (
    <AnimatePresence>
      {isOpened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className='absolute top-[calc(var(--navbar-height)_+_0.5rem)] right-4 z-20 flex max-h-72 w-[calc(100%_-_2rem)] flex-col overflow-y-auto rounded bg-slate-800 p-2 text-slate-50 ring-1 ring-slate-700 drop-shadow-xl scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 sm:max-h-80 sm:w-72'
          ref={containerRef}
        >
          <div className='flex flex-col border-b border-slate-700 pb-1'>
            <div className='flex items-center justify-between  pl-1 text-left text-base font-semibold sm:text-lg'>
              <span>Notifications</span>
              <button
                className='transition-colors hover:text-sky-400'
                onClick={toggle}
                aria-label='close notifications'
              >
                <XMarkIcon className='h-5' />
              </button>
            </div>
            {!data?.isAllRead ? (
              <button
                className='self-start pl-1 text-sm underline decoration-slate-600 underline-offset-2 transition hover:text-sky-400 hover:decoration-sky-600'
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </button>
            ) : null}
          </div>
          <Error />
          {isLoading && <Loading />}
          {data?.isEmpty ? (
            <span className='pt-1 pl-1 text-sm text-slate-300 sm:text-base'>
              You don&apos;t have any notifications
            </span>
          ) : null}
          {data && (
            <>
              {objectEntries(data.notifGroups).map(([type, group]) => {
                return group.map(notification => (
                  <Notification
                    key={notification.id}
                    type={type}
                    notification={notification}
                  />
                ));
              })}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notifications;

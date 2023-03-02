import Loading from '@ui/Loading';
import { AnimatePresence, motion } from 'framer-motion';
import { type RefObject, useRef, type FC } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useError } from '../hooks/useError';
import { useNotificationStore } from '../store/useNotificationsStore';
import { api } from '../utils/api';
import Notification from './Notification';

type NotificationsProps = {
  buttonRef: RefObject<HTMLButtonElement>;
};

const Notifications: FC<NotificationsProps> = ({ buttonRef }) => {
  const { isOpened, toggle } = useNotificationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, toggle, [buttonRef]);

  const { Error, setError } = useError();

  const { data, isLoading } = api.notification.getAll.useQuery(undefined, {
    onError: err => setError(err.message),
    refetchInterval: 1000 * 60 * 5,
  });

  return (
    <AnimatePresence>
      {isOpened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className='absolute top-[calc(var(--navbar-height)_+_0.5rem)] right-4 z-20 flex w-[calc(100%_-_2rem)] flex-col rounded bg-slate-800 p-2 text-slate-50 ring-1 ring-slate-700 drop-shadow-xl sm:w-72'
          ref={containerRef}
        >
          <span className='border-b border-slate-700 pb-1 pl-1 text-left text-base font-semibold sm:text-lg'>
            Notifications
          </span>
          <Error />
          {isLoading && <Loading />}
          {data && (
            <>
              {data.isEmpty ? (
                <span className='pt-1 text-sm text-slate-300 sm:text-base'>
                  You don&apos;t have any notifications
                </span>
              ) : (
                <>
                  {data.notifGroups.newResultNotifs.map(notification => (
                    <Notification
                      key={notification.id}
                      type='newResultNotifs'
                      notification={notification}
                    />
                  ))}
                </>
              )}
            </>
          )}
          {/* {data.length > 0 ? (
            data.map(notifGroup =>
              notifGroup.map(notification => (
                <div key={notification.id}>{notification.id}</div>
              ))
            )
          ) : (
            
          )} */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notifications;

import { AnimatePresence, motion } from 'framer-motion';
import { type RefObject, useRef, type FC } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useNotificationStore } from '../store/useNotificationsStore';

type NotificationsProps = {
  buttonRef: RefObject<HTMLButtonElement>;
};

const Notifications: FC<NotificationsProps> = ({ buttonRef }) => {
  const { isOpened, toggle } = useNotificationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, toggle, [buttonRef]);

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
          <span className='border-b border-slate-700 pb-1 text-base font-semibold sm:text-lg'>
            Notifications
          </span>
          <span className='pt-1 text-sm text-slate-300 sm:text-base'>
            Coming soon
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notifications;

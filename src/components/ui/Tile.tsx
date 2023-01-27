import cn from '../../lib/classes';
import { type ReactNode, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from './Loading';

type TileProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  isLoading?: boolean;
};

const Tile: FC<TileProps> = ({
  header,
  children,
  isLoading = false,
  className,
}) => {
  return (
    <section
      className={cn(
        'relative flex flex-col overflow-hidden rounded bg-slate-800 text-slate-50 ring-1 ring-slate-700',
        {
          'p-4': !header,
        },
        className
      )}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className='absolute top-0 left-0 grid h-full w-full place-items-center bg-black/50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Loading />
          </motion.div>
        )}
      </AnimatePresence>
      {header && (
        <div className='w-full rounded-t bg-slate-700 p-4 ring-1 ring-slate-600'>
          {header}
        </div>
      )}
      <div
        className={cn('w-full flex-1', {
          'p-4': header,
        })}
      >
        {children}
      </div>
    </section>
  );
};

export default Tile;

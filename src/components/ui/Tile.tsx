import cn from '../../lib/classes';
import { type ReactNode, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from './Loading';

export type TileProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  isLoading?: boolean;
  fixedHeader?: boolean;
};

const Tile: FC<TileProps> = ({
  header,
  children,
  isLoading = false,
  fixedHeader = false,
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
            className={cn(
              'absolute top-0 left-0 grid h-full w-full place-items-center bg-black/50',
              {
                'z-20': fixedHeader,
              }
            )}
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
        <div
          className={cn(
            'w-full rounded-t bg-slate-700 p-4 ring-1 ring-slate-600',
            {
              'sticky top-0 left-0 z-10': fixedHeader,
            }
          )}
        >
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

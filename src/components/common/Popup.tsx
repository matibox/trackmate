import { type ReactNode, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Tile, { type TileProps } from '@ui/Tile';
import cn from '~/lib/classes';
import { capitilize } from '~/utils/helpers';
import Button from '@ui/Button';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface PopupProps extends Omit<TileProps, 'children'> {
  children: ReactNode;
  condition: boolean;
  close: () => void;
}

const Popup: FC<PopupProps> = ({
  condition,
  children,
  close,
  className,
  ...tileProps
}) => {
  return (
    <AnimatePresence>
      {condition && (
        <>
          <motion.div
            className='fixed top-0 left-0 z-20 h-full w-full bg-black/40 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => close()}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className='relative z-30'
          >
            <Tile
              className={cn(
                'fixed top-1/2 left-1/2 w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-visible',
                className
              )}
              {...tileProps}
            >
              {children}
            </Tile>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

type PopupHeaderProps = {
  title: string;
  close: () => void;
  smallHeading?: boolean;
};

export const PopupHeader: FC<PopupHeaderProps> = ({
  title,
  close,
  smallHeading = false,
}) => {
  return (
    <div className='flex items-center justify-between'>
      <h1
        className={cn('text-xl', {
          'text-lg': smallHeading,
        })}
      >
        {capitilize(title)}
      </h1>
      <Button intent='secondary' size='xs' onClick={close}>
        <XMarkIcon className='h-6' />
      </Button>
    </div>
  );
};

export default Popup;

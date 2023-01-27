import { type ReactNode, type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Tile, { type TileProps } from './Tile';

interface PopupProps extends Omit<TileProps, 'children'> {
  children: ReactNode;
  condition: boolean;
  close: () => void;
}

const Popup: FC<PopupProps> = ({
  condition,
  children,
  close,
  ...tileProps
}) => {
  return (
    <AnimatePresence>
      {condition && (
        <>
          <motion.div
            className='fixed top-0 left-0 z-10 h-full w-full bg-black/40 backdrop-blur-sm'
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
            className='relative z-20'
          >
            <Tile
              className='fixed top-1/2 left-1/2 w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-visible'
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

export default Popup;

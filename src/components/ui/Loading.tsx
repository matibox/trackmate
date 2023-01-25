import { type FC } from 'react';
import { motion } from 'framer-motion';
import cn from '../../lib/classes';

const baseCircleClassName = 'h-1 w-1 rounded-full bg-slate-400 absolute';

const Loading: FC = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: 'linear',
      }}
      className='relative h-5 w-5 rounded-full'
    >
      <div
        className={cn(baseCircleClassName, 'top-0 left-1/2 -translate-x-1/2')}
      />
      <div
        className={cn(
          baseCircleClassName,
          'right-0 top-0 translate-y-[2.5px] -translate-x-[2.5px]'
        )}
      />
      <div
        className={cn(baseCircleClassName, 'top-1/2 right-0 -translate-y-1/2')}
      />
      <div
        className={cn(
          baseCircleClassName,
          'bottom-0 right-0 -translate-x-[2.5px] -translate-y-[2.5px]'
        )}
      />
      <div
        className={cn(
          baseCircleClassName,
          'bottom-0 left-1/2 -translate-x-1/2'
        )}
      />
      <div
        className={cn(
          baseCircleClassName,
          'bottom-0 left-0 translate-x-[2.5px] -translate-y-[2.5px]'
        )}
      />
      <div
        className={cn(baseCircleClassName, 'top-1/2 left-0 -translate-y-1/2')}
      />
      <div
        className={cn(
          baseCircleClassName,
          'top-0 left-0 translate-x-[2.5px] translate-y-[2.5px]'
        )}
      />
    </motion.div>
  );
};

export default Loading;

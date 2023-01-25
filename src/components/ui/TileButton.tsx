import { cva, type VariantProps } from 'class-variance-authority';
import { type FC, type ReactNode, type ButtonHTMLAttributes } from 'react';
import cn from '../../lib/classes';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from 'framer-motion';

const tileButtonStyles = cva(
  'group flex flex-col items-center rounded p-4 transition-all gap-2 relative bg-slate-700 text-slate-50 hover:bg-slate-600 ring-1 ring-slate-500 hover:ring-slate-400',
  {
    variants: {
      size: {
        normal: 'h-24',
        big: 'h-32',
      },
      checked: {
        true: 'ring-sky-500 hover:ring-sky-400',
      },
    },
  }
);

interface TileButtonProps
  extends VariantProps<typeof tileButtonStyles>,
    ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const TileButton: FC<TileButtonProps> = ({
  children,
  size,
  checked,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(tileButtonStyles({ size, checked }), className)}
      {...props}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className='absolute top-2 right-2 h-6 w-6'
          >
            <CheckCircleIcon
              className={cn(
                'h-full w-full text-sky-500 transition-colors group-hover:text-sky-400'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </button>
  );
};

export default TileButton;

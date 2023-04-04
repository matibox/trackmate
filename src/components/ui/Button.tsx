import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, type ReactNode, type FC } from 'react';
import cn from '../../lib/classes';

const buttonStyles = cva(
  'group rounded flex justify-center items-center transition',
  {
    variants: {
      intent: {
        primary:
          'ring-1 ring-sky-400 bg-sky-500 text-slate-50 font-semibold hover:bg-sky-400',
        secondary:
          'ring-1 ring-slate-600 text-slate-50 bg-slate-700 hover:bg-slate-600 hover:ring-slate-500',
        danger:
          'ring-1 ring-red-400 bg-red-500 text-slate-50 font-semibold hover:bg-red-400',
        subtleDanger:
          'ring-1 ring-slate-600 text-red-500 bg-slate-700 hover:bg-slate-600 hover:ring-red-500',
      },
      fullWidth: {
        true: 'w-full',
      },
      gap: {
        small: 'gap-1',
        normal: 'gap-2',
      },
      size: {
        xs: 'py-0.5 text-sm',
        small: 'px-4 py-1 text-sm',
        normal: 'px-6 py-2',
      },
    },
    defaultVariants: {
      gap: 'normal',
      size: 'normal',
    },
  }
);

interface ButtonProps
  extends VariantProps<typeof buttonStyles>,
    ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({
  children,
  intent,
  fullWidth,
  gap,
  size,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(buttonStyles({ intent, fullWidth, gap, size }), className, {
        'cursor-not-allowed bg-sky-900 text-slate-400 ring-sky-800 hover:bg-sky-900 hover:text-slate-400 hover:ring-sky-800':
          props.disabled,
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

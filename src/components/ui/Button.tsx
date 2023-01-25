import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, type ReactNode, type FC } from 'react';
import cn from '../../lib/classes';

const buttonStyles = cva(
  'group px-6 py-2 rounded flex justify-center items-center transition',
  {
    variants: {
      intent: {
        primary:
          'ring-1 ring-sky-400 bg-sky-500 text-slate-50 font-semibold hover:bg-sky-400',
      },
      fullWidth: {
        true: 'w-full',
      },
      gap: {
        small: 'gap-1',
        normal: 'gap-2',
      },
    },
    defaultVariants: {
      gap: 'normal',
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
  className,
  ...props
}) => {
  return (
    <button
      className={cn(buttonStyles({ intent, fullWidth, gap }), className, {
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

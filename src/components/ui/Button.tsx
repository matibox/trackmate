import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, type ReactNode, type FC } from 'react';
import cn from '../../lib/classes';

const buttonStyles = cva(
  'group px-6 py-2 rounded flex justify-center gap-1.5 items-center transition',
  {
    variants: {
      intent: {
        primary:
          'ring-1 ring-sky-400 bg-sky-500 text-slate-50 font-semibold hover:bg-sky-400',
      },
      fullWidth: {
        true: 'w-full',
      },
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
  className,
  ...props
}) => {
  return (
    <button
      className={cn(buttonStyles({ intent, fullWidth }), className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

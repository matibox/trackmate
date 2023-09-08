import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-slate-950 focus-visible:ring-slate-50 text-slate-50',
  {
    variants: {
      variant: {
        primary:
          'bg-sky-500 border border-sky-400 hover:bg-sky-400 hover:border-sky-300',
        secondary:
          'bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800',
        positive:
          'bg-emerald-900 border border-emerald-700 text-emerald-200 hover:bg-emerald-800 hover:border-emerald-300',
        destructive:
          'bg-red-900 border border-red-700 text-red-100 hover:bg-red-800 hover:border-red-500',
        outline:
          'border border-slate-800 hover:border-slate-700 hover:bg-slate-800',
        ghost: 'hover:bg-slate-800',
        link: 'underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

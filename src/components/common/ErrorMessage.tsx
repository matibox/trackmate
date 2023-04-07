import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes, type FC } from 'react';
import cn from '~/lib/classes';

const errorStyles = cva('text-red-500', {
  variants: {
    size: {
      small: 'text-sm sm:text-base',
      large: 'text-base sm:text-lg',
    },
  },
  defaultVariants: {
    size: 'small',
  },
});

export interface ErrorMessageProps
  extends VariantProps<typeof errorStyles>,
    HTMLAttributes<HTMLSpanElement> {
  error: string | undefined;
}

const ErrorMessage: FC<ErrorMessageProps> = ({ error, size, className }) => {
  return (
    <>
      {error && (
        <span className={cn(errorStyles({ size }), className)}>{error}</span>
      )}
    </>
  );
};

export default ErrorMessage;

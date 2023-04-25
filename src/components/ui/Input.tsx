import { type InputHTMLAttributes, forwardRef } from 'react';
import cn from '../../lib/classes';
import ErrorWrapper from '../common/ErrorWrapper';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error: string[] | undefined;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <ErrorWrapper error={error}>
      <input
        className={cn(
          'h-8 w-full appearance-none rounded px-2 py-1 tracking-tight text-slate-900 selection:bg-sky-500 selection:text-slate-50 focus:outline-none focus:ring focus:ring-sky-600',
          className
        )}
        {...props}
        ref={ref}
      />
    </ErrorWrapper>
  );
});

export default Input;

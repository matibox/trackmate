import { type FormHTMLAttributes, type ReactNode, type FC } from 'react';
import cn from '../../lib/classes';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

const Form: FC<FormProps> = ({ children, className, onSubmit, ...props }) => {
  return (
    <form
      className={cn('flex w-full flex-wrap gap-2 sm:gap-4', className)}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
};

export default Form;

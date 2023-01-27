import { type LabelHTMLAttributes, type FC, type ReactNode } from 'react';
import cn from '../../lib/classes';
import { capitilize } from '../../utils/helpers';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  children: ReactNode;
}

const Label: FC<LabelProps> = ({ label, children, className, ...props }) => {
  return (
    <label
      className={cn('grid w-full gap-1 sm:w-[calc(50%_-_0.5rem)]', className)}
      {...props}
    >
      <span className='text-base'>{capitilize(label)}</span>
      {children}
    </label>
  );
};

export default Label;

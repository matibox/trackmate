import { type LabelHTMLAttributes, type FC, type ReactNode } from 'react';
import cn from '../../lib/classes';
import { capitilize } from '../../utils/helpers';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  optional?: boolean;
  children: ReactNode;
}

const Label: FC<LabelProps> = ({
  label,
  optional = false,
  children,
  className,
  ...props
}) => {
  return (
    <label
      className={cn('grid w-full gap-1 sm:w-[calc(50%_-_0.5rem)]', className)}
      {...props}
    >
      <span className='text-base'>
        {capitilize(label)}
        <span className='text-slate-300'>{!optional && ' *'}</span>
      </span>
      {children}
    </label>
  );
};

export default Label;

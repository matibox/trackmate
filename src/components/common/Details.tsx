import { type ReactNode, type FC, type HTMLAttributes } from 'react';
import cn from '~/lib/classes';

interface DetailsProps extends HTMLAttributes<HTMLDivElement> {
  details: Array<{
    label: string;
    value: string | ReactNode;
    condition?: boolean;
  }>;
  className?: string;
  children?: ReactNode;
}

const Details: FC<DetailsProps> = ({
  details,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('mb-4 grid grid-cols-2 gap-y-4 sm:grid-cols-3', className)}
      {...props}
    >
      {details.map(detail => {
        const show = detail.condition ?? true;
        return show ? (
          <div key={crypto.randomUUID()} className='flex flex-col'>
            <span className='text-slate-300'>{detail.label}</span>
            {typeof detail.value === 'string' ? (
              <span>{detail.value}</span>
            ) : (
              detail.value
            )}
          </div>
        ) : null;
      })}
      {children}
    </div>
  );
};

export default Details;

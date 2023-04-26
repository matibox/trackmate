import { type ReactNode, type FC, type HTMLAttributes } from 'react';
import cn from '~/lib/classes';
import crypto from 'crypto';

interface DetailsProps extends HTMLAttributes<HTMLDivElement> {
  details: Array<{
    label: string;
    value: string | ReactNode;
    condition?: boolean;
    span?: 1 | 2 | 3 | 4;
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
    <div className={cn('grid grid-cols-2 gap-y-4', className)} {...props}>
      {details.map(detail => {
        const show = detail.condition ?? true;
        const colSpan = detail.span ?? 1;
        return show ? (
          <div
            key={crypto.randomBytes(20).toString('hex')}
            className={`flex flex-col col-span-${colSpan}`}
          >
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

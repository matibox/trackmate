import cn from '../../lib/classes';
import { type ReactNode, type FC } from 'react';

type TileProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
};

const Tile: FC<TileProps> = ({ header, children, className }) => {
  return (
    <section
      className={cn(
        'flex flex-col overflow-hidden rounded bg-slate-800 text-slate-50 ring-1 ring-slate-700',
        {
          'p-4': !header,
        },
        className
      )}
    >
      {header && (
        <div className='w-full bg-slate-700 p-4 ring-1 ring-slate-600'>
          {header}
        </div>
      )}
      <div
        className={cn('w-full flex-1', {
          'p-4': header,
        })}
      >
        {children}
      </div>
    </section>
  );
};

export default Tile;

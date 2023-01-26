import cn from '../../lib/classes';
import { type ReactNode, type FC } from 'react';

type TileProps = {
  children: ReactNode;
  heading?: ReactNode;
};

const Tile: FC<TileProps> = ({ heading, children }) => {
  return (
    <section
      className={cn(
        'flex flex-col overflow-hidden rounded bg-slate-800 text-slate-50 ring-1 ring-slate-700',
        {
          'p-4': !heading,
        }
      )}
    >
      {heading && (
        <div className='w-full bg-slate-700 p-4 ring-1 ring-slate-600'>
          {heading}
        </div>
      )}
      <div
        className={cn('w-full flex-1', {
          'p-4': heading,
        })}
      >
        {children}
      </div>
    </section>
  );
};

export default Tile;

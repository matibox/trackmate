import { CheckCircleIcon } from 'lucide-react';
import { type HTMLAttributes } from 'react';
import Flag from '~/components/Flag';
import { type countries } from '~/lib/constants';
import { capitalize, cn } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';

interface DriverButtonProps extends HTMLAttributes<HTMLButtonElement> {
  driver: RouterOutputs['user']['byId'][number];
  isActive: boolean;
}

export default function DriverButton({
  driver,
  isActive,
  className,
  ...props
}: DriverButtonProps) {
  return (
    <button
      key={driver.id}
      type='button'
      className={cn(
        'flex w-full items-center gap-2 rounded-md bg-slate-950 px-3.5 py-2 ring-1 ring-slate-800 transition hover:bg-slate-900 hover:ring-slate-700',
        {
          'bg-slate-900': isActive,
        },
        className
      )}
      {...props}
    >
      <Flag country={driver.profile?.country as (typeof countries)[number]} />
      <div>
        <span>{driver.firstName?.slice(0, 1).toUpperCase()}.</span>
        <span> {capitalize(driver.lastName ?? '')}</span>
      </div>
      <CheckCircleIcon
        className={cn(
          'ml-auto h-4 w-4 text-sky-500 opacity-0 transition-opacity',
          {
            'opacity-100': isActive,
          }
        )}
      />
    </button>
  );
}

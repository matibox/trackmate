import { UserMinusIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';
import { type RouterOutputs } from '../../../utils/api';

type DriverProps = {
  driver: NonNullable<
    RouterOutputs['team']['getManagingFor']
  >['drivers'][number];
};

const Driver: FC<DriverProps> = ({ driver }) => {
  return (
    <li className='flex justify-between border-y border-slate-700 py-2 first:border-t-0 last:border-b-0'>
      <span>{driver.name}</span>
      <button>
        <UserMinusIcon className='h-5 text-slate-50 transition-colors hover:text-red-500' />
      </button>
    </li>
  );
};

export default Driver;

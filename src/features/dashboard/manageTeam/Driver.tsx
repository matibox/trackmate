import { UserMinusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { type FC } from 'react';
import { useManagingTeamStore } from './store';
import { type RouterOutputs } from '../../../utils/api';

type DriverProps = {
  driver: NonNullable<
    RouterOutputs['team']['getManagingFor']
  >['drivers'][number];
};

const Driver: FC<DriverProps> = ({ driver }) => {
  const {
    deleteDriverPopup: { open },
  } = useManagingTeamStore();

  return (
    <li className='flex justify-between border-y border-slate-700 py-2 first:border-t-0 last:border-b-0'>
      <Link
        draggable={false}
        href={`/profile/${driver.id}`}
        className='transition-colors hover:text-sky-400'
      >
        {driver.name}
      </Link>
      <button onClick={() => open(driver.id, driver.name ?? undefined)}>
        <UserMinusIcon className='h-5 text-slate-50 transition-colors hover:text-red-500' />
      </button>
    </li>
  );
};

export default Driver;

import { UsersIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';

const TeamHeader: FC = () => {
  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='hidden gap-2 text-xl sm:inline-flex sm:items-center lg:gap-3'>
        <UsersIcon className='h-6' />
        <span>Team</span>
      </h1>
    </div>
  );
};

export default TeamHeader;

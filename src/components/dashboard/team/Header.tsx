import { UsersIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';

const TeamHeader: FC = () => {
  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='inline-flex items-center gap-2 text-xl lg:gap-3'>
        <UsersIcon className='h-6' />
        <span>Team</span>
      </h1>
    </div>
  );
};

export default TeamHeader;

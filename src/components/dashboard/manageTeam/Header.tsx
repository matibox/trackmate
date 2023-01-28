import { TrashIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import { type FC } from 'react';

const ManageTeamHeader: FC = () => {
  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='inline-flex items-center gap-2 text-xl lg:gap-3'>
        <UserGroupIcon className='h-6' />
        <span>Manage team</span>
      </h1>
      <Button intent='danger' size='small' gap='small'>
        <span>Delete team</span>
        <TrashIcon className='h-5' />
      </Button>
    </div>
  );
};

export default ManageTeamHeader;

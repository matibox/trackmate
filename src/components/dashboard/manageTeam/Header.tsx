import { TrashIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import { type FC } from 'react';
import { useManagingTeamStore } from '../../../store/useManagingTeamStore';
import { type RouterOutputs } from '../../../utils/api';

type ManageTeamHeaderProps = {
  team: RouterOutputs['team']['getManagingFor'] | undefined;
};

const ManageTeamHeader: FC<ManageTeamHeaderProps> = ({ team }) => {
  const {
    deleteTeamPopup: { open },
  } = useManagingTeamStore();
  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='inline-flex items-center gap-2 text-xl lg:gap-3'>
        <UserGroupIcon className='h-6' />
        <span>Manage team</span>
      </h1>
      {team && (
        <Button intent='danger' size='small' gap='small' onClick={open}>
          <span>Delete team</span>
          <TrashIcon className='h-4' />
        </Button>
      )}
    </div>
  );
};

export default ManageTeamHeader;

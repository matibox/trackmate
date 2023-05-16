import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { useManagingTeamStore } from './store';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import Driver from './Driver';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import Manager from './Manager';

const ManageTeam: FC = () => {
  const { data: session } = useSession();
  const { Error, setError } = useError();
  const {
    createTeamPopup: { open: createOpen },
    editTeamPopup: { open: editOpen },
    deleteTeamPopup: { open: deleteOpen },
    setTeam,
  } = useManagingTeamStore();

  const { data: team, isLoading } = api.team.getManagingFor.useQuery(
    undefined,
    {
      onSettled: setTeam,
      onError: err => setError(err.message),
      enabled: Boolean(hasRole(session, 'manager')),
    }
  );

  if (!hasRole(session, 'manager')) return null;

  return (
    <>
      <Tile
        header={
          <div className='flex items-center justify-between gap-4'>
            <h1 className='inline-flex items-center gap-2 text-xl lg:gap-3'>
              <UserGroupIcon className='h-6' />
              <span>Manage team</span>
            </h1>
            {team && (
              <Button
                intent='danger'
                size='small'
                gap='small'
                onClick={deleteOpen}
              >
                <span>Delete team</span>
                <TrashIcon className='h-4' />
              </Button>
            )}
          </div>
        }
        isLoading={isLoading}
      >
        {team ? (
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between font-semibold'>
              <span className='text-lg'>{team.name}</span>
              <span>
                {team.drivers.length}
                {team.drivers.length === 1 ? ' driver' : ' drivers'}
              </span>
            </div>
            <ul>
              {team.drivers.map(driver => (
                <Driver key={driver.id} driver={driver} />
              ))}
            </ul>
            <span className='self-end font-semibold'>
              {team.managers.length} other
              {team.managers.length === 1 ? ' manager' : ' managers'}
            </span>
            <ul>
              {team.managers.map(manager => (
                <Manager key={manager.id} manager={manager} teamId={team.id} />
              ))}
            </ul>
            <Button
              intent='primary'
              gap='small'
              size='small'
              className='self-end'
              onClick={editOpen}
            >
              <span>Edit team</span>
              <PencilSquareIcon className='h-4' />
            </Button>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4'>
            <span className='text-slate-300'>
              You are not managing any teams
            </span>
            <Button
              intent='primary'
              size='small'
              gap='small'
              onClick={createOpen}
            >
              <span>Create team</span>
              <PlusIcon className='h-5' />
            </Button>
          </div>
        )}
        <Error size='large' />
      </Tile>
    </>
  );
};

export default ManageTeam;

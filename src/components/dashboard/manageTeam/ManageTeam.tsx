import { PlusIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { useManagingTeamStore } from '../../../store/useManagingTeamStore';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import Driver from './Driver';
import ManageTeamHeader from './Header';

const ManageTeam: FC = () => {
  const { data: session } = useSession();
  const { Error, setError } = useError();
  const {
    createTeamPopup: { open },
    setTeam,
  } = useManagingTeamStore();

  const { data: team, isLoading } = api.team.getManagingFor.useQuery(
    undefined,
    {
      onSettled(data) {
        setTeam(data);
      },
      onError(err) {
        setError(err.message);
      },
      enabled: Boolean(hasRole(session, 'manager')),
    }
  );

  if (!hasRole(session, 'manager')) return null;

  //TODO edit/delete team
  //TODO add/delete drivers

  return (
    <>
      <Tile header={<ManageTeamHeader team={team} />} isLoading={isLoading}>
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
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4'>
            <span className='text-slate-300'>
              You are not managing any teams
            </span>
            <Button intent='primary' size='small' gap='small' onClick={open}>
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

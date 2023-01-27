import { PlusIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { useCreateTeamStore } from '../../../store/useCreateTeamStore';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import ManageTeamHeader from './Header';

const ManageTeam: FC = () => {
  const { data: session } = useSession();
  const { Error, setError } = useError();
  const { open } = useCreateTeamStore();

  const { data, isLoading } = api.team.getManagingFor.useQuery(undefined, {
    onError(err) {
      setError(err.message);
    },
    enabled: Boolean(hasRole(session, 'manager')),
  });

  if (!hasRole(session, 'manager')) return null;

  return (
    <Tile header={<ManageTeamHeader />} isLoading={isLoading}>
      {data && (
        <>
          {data.notFound ? (
            <div className='flex flex-col items-center gap-4'>
              <span className='text-slate-300'>
                You are not managing any teams
              </span>
              <Button intent='primary' size='small' gap='small' onClick={open}>
                <span>Create team</span>
                <PlusIcon className='h-5' />
              </Button>
            </div>
          ) : (
            <>{/*//TODO display team content */}</>
          )}
        </>
      )}
      <Error size='large' />
    </Tile>
  );
};

export default ManageTeam;

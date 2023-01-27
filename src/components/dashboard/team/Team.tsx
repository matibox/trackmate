import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import TeamHeader from './Header';

const Team: FC = () => {
  const { data: session } = useSession();
  const { Error, setError } = useError();

  if (!hasRole(session, 'driver')) return null;

  const { data, isLoading } = api.team.getDriveFor.useQuery(undefined, {
    onError(err) {
      setError(err.message);
    },
  });

  return (
    <Tile header={<TeamHeader />} isLoading={isLoading}>
      <Error size='large' />
      {data && (
        <>
          {data.notFound ? (
            <span className='block text-center text-base text-slate-300 sm:text-lg'>
              You don&apos;t drive for any team, contact your manager.
            </span>
          ) : (
            <>{/*//TODO display team details */}</>
          )}
        </>
      )}
    </Tile>
  );
};

export default Team;

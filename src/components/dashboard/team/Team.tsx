import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import cn from '../../../lib/classes';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import DriverList from '../../DriverList';
import Event from './Event';
import TeamHeader from './Header';

const Team: FC = () => {
  const { data: session } = useSession();
  const { Error, setError } = useError();

  const { data: team, isLoading } = api.team.getDriveFor.useQuery(undefined, {
    onError(err) {
      setError(err.message);
    },
    enabled: Boolean(hasRole(session, 'driver')),
  });

  if (!hasRole(session, 'driver')) return null;

  return (
    <Tile header={<TeamHeader />} isLoading={isLoading}>
      <Error size='large' />
      {team ? (
        <div className='flex h-full flex-col gap-2'>
          <div className='flex items-center justify-between font-semibold'>
            <span className='text-lg'>{team.name}</span>
            <span>
              {team.drivers.length}
              {team.drivers.length === 1 ? ' driver' : ' drivers'}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-slate-300'>Drivers</span>
            <span>
              <DriverList drivers={team.drivers} />
            </span>
          </div>
          <div className='border-t border-slate-700 py-2'>
            <span className='text-base font-semibold sm:text-lg'>
              Upcoming team event
            </span>
          </div>
          <div
            className={cn({
              'flex justify-center': team.events.length === 0,
            })}
          >
            {team.events.length > 0 ? (
              team.events.map(event => <Event key={event.id} event={event} />)
            ) : (
              <span className='block text-lg text-slate-300'>
                There are no team events
              </span>
            )}
          </div>
        </div>
      ) : (
        <span className='block text-center text-base text-slate-300 sm:text-lg'>
          You don&apos;t drive for any team, contact your manager.
        </span>
      )}
    </Tile>
  );
};

export default Team;

import Tile from '@ui/Tile';
import { type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import useStats from './hooks/useStats';

type StatsProps = {
  profile: RouterOutputs['user']['getProfile'] | undefined;
  isLoading: boolean;
};

const Stats: FC<StatsProps> = ({ profile, isLoading }) => {
  const { wins, podiums, polePositions, raceStarts, DNFs } = useStats(profile);

  return (
    <Tile isLoading={isLoading}>
      {profile && (
        <div className='flex h-full flex-col justify-center gap-2'>
          <h1 className='text-lg font-semibold'>User statistics</h1>
          <div className='flex flex-col sm:grid sm:grid-cols-2 sm:gap-y-1 md:grid-cols-3'>
            <div>
              Race starts:
              <span className='font-semibold text-sky-400'> {raceStarts}</span>
            </div>
            <div>
              Wins:
              <span className='font-semibold text-sky-400'> {wins}</span>
            </div>
            <div>
              Podiums:
              <span className='font-semibold text-sky-400'> {podiums}</span>
            </div>
            <div>
              Poles:
              <span className='font-semibold text-sky-400'>
                {' '}
                {polePositions}
              </span>
            </div>
            <div>
              DNFs:
              <span className='font-semibold text-sky-400'> {DNFs}</span>
            </div>
          </div>
        </div>
      )}
    </Tile>
  );
};

export default Stats;

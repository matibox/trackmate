import Tile from '@ui/Tile';
import { type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import Setup from './Setup';

type SetupsProps = {
  setups: RouterOutputs['setup']['byQuery'] | undefined;
  isLoading: boolean;
};

const Setups: FC<SetupsProps> = ({ setups, isLoading }) => {
  return (
    <Tile className='row-span-2 w-full'>
      <div className='grid grid-cols-[repeat(auto-fit,_min(100%,_20rem))] justify-center gap-4'>
        {setups?.map(setup => (
          <Setup key={setup.id} setup={setup} />
        ))}
        {setups?.length === 0 && !isLoading && (
          <span className='text-center text-slate-300'>
            There are no setups
          </span>
        )}
      </div>
    </Tile>
  );
};

export default Setups;

import { PlusIcon } from '@heroicons/react/20/solid';
import { TrophyIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import { type FC } from 'react';
import { useChampionshipStore } from '../../../store/useChampionshipStore';

const ChampionshipsHeader: FC = () => {
  const {
    createChampionshipPopup: { open },
  } = useChampionshipStore();

  return (
    <div className='flex items-center justify-between gap-4'>
      <h1 className='inline-flex items-center gap-2 text-xl lg:gap-3'>
        <TrophyIcon className='h-6' />
        <span>Championships</span>
      </h1>
      <Button intent='primary' size='small' gap='small' onClick={open}>
        <span>Create</span>
        <PlusIcon className='h-5' />
      </Button>
    </div>
  );
};

export default ChampionshipsHeader;

import { type FC } from 'react';
import Confirmation from '~/components/common/Confirmation';
import { useDeleteStintStore } from '../store';
import Button from '@ui/Button';
import { TrashIcon } from '@heroicons/react/20/solid';

const DeleteStint: FC = () => {
  const { close, isOpened, stintId } = useDeleteStintStore();

  return (
    <Confirmation
      close={close}
      headerMessage='Delete stint'
      isOpened={isOpened}
      message='Are you sure?'
    >
      <Button
        intent='danger'
        // onClick={() => deleteChampionship({ championshipId })}
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteStint;

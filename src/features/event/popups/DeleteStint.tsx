import { type FC } from 'react';
import Confirmation from '~/components/common/Confirmation';
import { useDeleteStintStore } from '../store';
import Button from '@ui/Button';
import { TrashIcon } from '@heroicons/react/20/solid';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';

const DeleteStint: FC = () => {
  const { close, isOpened, stintId } = useDeleteStintStore();

  const utils = api.useContext();
  const { Error, setError } = useError();

  const { mutate: deleteStint, isLoading } = api.stint.delete.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.event.single.invalidate();
      close();
    },
  });

  return (
    <Confirmation
      close={close}
      headerMessage='Delete stint'
      isOpened={isOpened}
      message='Are you sure?'
      isLoading={isLoading}
      error={<Error />}
    >
      <Button
        intent='danger'
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onClick={() => deleteStint({ stintId: stintId! })}
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteStint;

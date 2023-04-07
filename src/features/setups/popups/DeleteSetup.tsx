import { type FC } from 'react';
import Confirmation from '~/components/common/Confirmation';
import Button from '@ui/Button';
import { TrashIcon } from '@heroicons/react/24/outline';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import { useSetupStore } from '../store';

const DeleteSetup: FC = () => {
  const {
    delete: { isOpened, close, setup },
  } = useSetupStore();

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: deleteSetup, isLoading } = api.setup.delete.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.setup.invalidate();
    },
  });

  return (
    <Confirmation
      close={close}
      headerMessage={`Delete ${setup?.name ?? 'setup'}`}
      isOpened={isOpened}
      message='Are you sure?'
      error={<Error />}
      isLoading={isLoading}
    >
      <Button
        intent='danger'
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          deleteSetup({ id: setup!.id });
          close();
        }}
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteSetup;

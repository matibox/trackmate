import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Confirmation from '@ui/Confirmation';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { useChampionshipStore } from '../../../store/useChampionshipStore';
import { api } from '../../../utils/api';

const DeleteChampionship: FC = () => {
  const {
    deleteChampionshipPopup: {
      championshipId,
      championshipName,
      isOpened,
      close,
    },
  } = useChampionshipStore();

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: deleteChampionship, isLoading } =
    api.championship.delete.useMutation({
      onError(err) {
        setError(err.message);
      },
      async onSuccess() {
        close();
        await utils.championship.get.invalidate();
      },
    });

  return (
    <Confirmation
      headerMessage={`Delete ${championshipName ?? 'championship'}`}
      close={close}
      isOpened={isOpened}
      message={`Are you sure? All associated events with ${
        championshipName ?? 'this championship'
      } will be deleted.`}
      isLoading={isLoading}
      error={<Error />}
    >
      <Button
        intent='danger'
        onClick={() => deleteChampionship({ championshipId })}
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteChampionship;

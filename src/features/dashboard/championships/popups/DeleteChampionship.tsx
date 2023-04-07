import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Confirmation from '~/components/common/Confirmation';
import { type FC } from 'react';
import { useError } from '~/hooks/useError';
import { api } from '~/utils/api';
import { useChampionshipStore } from '../store';

const DeleteChampionship: FC = () => {
  const {
    delete: { championshipId, championshipName, isOpened, close },
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
        await utils.event.invalidate();
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

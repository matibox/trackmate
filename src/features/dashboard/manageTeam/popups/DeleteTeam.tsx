import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import { type FC } from 'react';
import { useError } from '../../../../hooks/useError';
import { api } from '../../../../utils/api';
import Confirmation from '~/components/common/Confirmation';
import { useManagingTeamStore } from '../store';

const DeleteTeam: FC = () => {
  const {
    team,
    deleteTeamPopup: { close, isOpened },
  } = useManagingTeamStore();
  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: deleteTeam, isLoading } = api.team.delete.useMutation({
    async onSuccess() {
      close();
      await utils.team.getManagingFor.invalidate();
      await utils.team.getDriveFor.invalidate();
    },
    onError(err) {
      setError(err.message);
    },
  });

  return (
    <Confirmation
      close={close}
      isOpened={isOpened}
      headerMessage={`Delete ${team?.name ?? 'team'}`}
      message='Are you sure?'
      isLoading={isLoading}
      error={<Error />}
    >
      <Button intent='danger' onClick={() => deleteTeam({ teamId: team?.id })}>
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteTeam;

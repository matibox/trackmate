import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import { type FC } from 'react';
import { useError } from '../../../../hooks/useError';
import { useManagingTeamStore } from '../store';
import { api } from '../../../../utils/api';
import Confirmation from '~/components/common/Confirmation';

const DeleteDriver: FC = () => {
  const {
    deleteDriverPopup: { close, driverName, driverId, isOpened },
    team,
  } = useManagingTeamStore();
  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: removeDriver, isLoading } = api.team.removeDriver.useMutation(
    {
      onError(err) {
        setError(err.message);
      },
      async onSuccess() {
        close();
        await utils.team.getDriveFor.invalidate();
        await utils.team.getManagingFor.invalidate();
      },
    }
  );

  return (
    <Confirmation
      close={close}
      headerMessage={`Remove ${driverName ?? 'driver'} from ${
        team?.name ?? 'team'
      }`}
      isOpened={isOpened}
      message='Are you sure?'
      isLoading={isLoading}
      error={<Error />}
    >
      <Button
        intent='danger'
        onClick={() =>
          removeDriver({
            driverId: driverId,
            teamId: team?.id,
          })
        }
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteDriver;

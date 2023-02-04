import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import Confirmation from '@ui/Confirmation';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { useEventStore } from '../../../store/useEventStore';
import { api } from '../../../utils/api';

const DeleteEvent: FC = () => {
  const { championshipName, eventName, close, isOpened, eventId } =
    useEventStore();

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: deleteEvent, isLoading } = api.event.delete.useMutation({
    async onSuccess() {
      close();
      await utils.event.getDrivingEvents.invalidate();
      await utils.event.getManagingEvents.invalidate();
      await utils.team.getDriveFor.invalidate();
      await utils.championship.get.invalidate();
    },
    onError: err => setError(err.message),
  });

  return (
    <Confirmation
      close={close}
      headerMessage={`Delete ${
        championshipName
          ? `${championshipName} - ${eventName ?? 'Event'}`
          : eventName ?? 'Event'
      }`}
      isOpened={isOpened}
      message='Are you sure?'
      isLoading={isLoading}
      error={<Error />}
    >
      <Button
        intent='danger'
        onClick={() => deleteEvent({ eventId: eventId as string })}
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteEvent;

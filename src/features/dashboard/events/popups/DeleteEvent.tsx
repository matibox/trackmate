import { TrashIcon } from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import { type FC } from 'react';
import { useError } from '~/hooks/useError';
import { api } from '~/utils/api';
import Confirmation from '~/components/common/Confirmation';
import { useEventStore } from '../store';

const DeleteEvent: FC = () => {
  const { close, isOpened, event, additionalActions } = useEventStore().delete;

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: deleteEvent, isLoading } = api.event.delete.useMutation({
    async onSuccess() {
      additionalActions && (await additionalActions());
      close();
      await utils.event.invalidate();
      await utils.team.getDriveFor.invalidate();
      await utils.championship.get.invalidate();
    },
    onError: err => setError(err.message),
  });

  return (
    <Confirmation
      close={close}
      headerMessage={`Delete ${
        event?.championship?.name
          ? `${event?.championship?.name} - ${event.title ?? 'Event'}`
          : event?.title ?? 'Event'
      }`}
      isOpened={isOpened}
      message='Are you sure?'
      isLoading={isLoading}
      error={<Error />}
    >
      <Button
        intent='danger'
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onClick={() => deleteEvent({ eventId: event!.id })}
      >
        <span>Delete</span>
        <TrashIcon className='h-5' />
      </Button>
    </Confirmation>
  );
};

export default DeleteEvent;

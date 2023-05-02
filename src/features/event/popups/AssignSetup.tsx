import { type FC } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEventSetupAssignStore } from '../store';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';

const AssignSetup: FC = () => {
  const { close, isOpened, eventId } = useEventSetupAssignStore();

  const { Error, setError } = useError();

  const utils = api.useContext();
  const { mutate: toggleAssignment, isLoading } =
    api.setup.toggleAssignment.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
        close();
      },
    });

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Assign new setup' />}
      isLoading={isLoading}
      smallHeaderPadding
    >
      test
      <Error />
    </Popup>
  );
};

export default AssignSetup;

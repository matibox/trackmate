import { type FC } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEditRosterStore } from '../store';

const EditRoster: FC = () => {
  const { close, isOpened, roster } = useEditRosterStore();

  return (
    <Popup
      condition={isOpened}
      close={close}
      header={<PopupHeader close={close} title='Edit roster' />}
    >
      test
    </Popup>
  );
};

export default EditRoster;

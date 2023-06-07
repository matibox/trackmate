import { type FC } from 'react';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useEditRosterStore } from '../store';

const EditRoster: FC = () => {
  const { close, isOpened, championship } = useEditRosterStore();

  return (
    <Popup
      condition={isOpened}
      close={close}
      header={
        <PopupHeader
          close={close}
          title={
            championship
              ? `Edit roster for ${championship.title}`
              : 'Edit roster'
          }
        />
      }
    >
      test
    </Popup>
  );
};

export default EditRoster;

import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { type FC } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

const Settings: FC = () => {
  const { close, opened } = useSettingsStore();

  return (
    <Popup
      close={close}
      condition={opened}
      header={<PopupHeader close={close} title='Settings' />}
    >
      settings
    </Popup>
  );
};

export default Settings;

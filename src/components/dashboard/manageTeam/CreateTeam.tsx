import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import { type FC } from 'react';
import { useCreateTeamStore } from '../../../store/useCreateTeamStore';

const CreateTeam: FC = () => {
  const { close, isOpened } = useCreateTeamStore();

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='create team' />}
    >
      create team
    </Popup>
  );
};

export default CreateTeam;

import Popup, { PopupHeader } from '~/components/common/Popup';
import { type FC } from 'react';
import useForm from '~/hooks/useForm';
import { useManagingTeamStore } from '../store';
import { api } from '~/utils/api';
import TeamForm, { formSchema } from '../TeamForm';

const CreateTeam: FC = () => {
  const {
    createTeamPopup: { isOpened, close },
  } = useManagingTeamStore();

  const { errors, handleSubmit } = useForm(formSchema, values => {
    createTeam(values);
  });

  const utils = api.useContext();
  const { mutate: createTeam, isLoading } = api.team.create.useMutation({
    onSuccess: async () => {
      await utils.team.getDriveFor.invalidate();
      await utils.team.getManagingFor.invalidate();
      close();
    },
  });

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='create team' />}
    >
      <TeamForm
        errors={errors}
        handleSubmit={handleSubmit}
        submitLoading={isLoading}
      />
    </Popup>
  );
};

export default CreateTeam;

import Popup, { PopupHeader } from '~/components/common/Popup';
import { type FC } from 'react';
import { type z } from 'zod';
import useForm from '../../../hooks/useForm';
import { useManagingTeamStore } from '../../../store/useManagingTeamStore';
import { api } from '../../../utils/api';
import TeamForm, { formSchema } from './TeamForm';

const EditTeam: FC = () => {
  const {
    editTeamPopup: { isOpened, close },
    team,
  } = useManagingTeamStore();

  const { errors, handleSubmit } = useForm(formSchema, values => {
    editTeam({ teamId: team?.id, ...values });
  });

  const utils = api.useContext();
  const { mutate: editTeam, isLoading } = api.team.edit.useMutation({
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
      header={<PopupHeader close={close} title='edit team' />}
    >
      <TeamForm
        errors={errors}
        handleSubmit={handleSubmit}
        submitLoading={isLoading}
        initialData={
          {
            drivers: team?.drivers,
            name: team?.name,
            socialMedia: team?.socialMedia,
          } as z.infer<typeof formSchema>
        }
      />
    </Popup>
  );
};

export default EditTeam;

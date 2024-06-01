import { api } from '~/utils/api';
import TeamList from './TeamList';

export default function YourTeams() {
  const { data, status, error } = api.team.listMemberOf.useQuery();

  return <TeamList data={data} status={status} error={error} addTeamButton />;
}

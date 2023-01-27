import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { hasRole } from '../../../utils/helpers';
import ManageTeamHeader from './Header';

const ManageTeam: FC = () => {
  const { data: session } = useSession();

  if (!hasRole(session, 'manager')) return null;

  return <Tile header={<ManageTeamHeader />}>manage team</Tile>;
};

export default ManageTeam;

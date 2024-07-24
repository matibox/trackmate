import { type $Enums } from '@prisma/client';
import { MenuIcon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import { cn } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';
import { useNewTeam } from '../new-team/newTeamStore';
import DeleteTeamDialog from './DeleteTeam';

export type Team = RouterOutputs['team']['memberOfRoles'][number];
export type Role = $Enums.RosterRole | Exclude<$Enums.TeamRole, 'member'>;

export default function TeamDropdown({
  team,
  roles,
  className,
}: {
  team: Team;
  roles: Role[];
  className?: string;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const { setSheetOpened, setEditMode, setEditModeTeamId, setData } =
    useNewTeam();

  const handleEditTeam = () => {
    setSheetOpened(true);
    setEditMode(true);
    setEditModeTeamId(team.id);

    setData({
      name: team.name,
      abbreviation: team.abbreviation,
      password: '',
      profilePicture: null,
    });
  };

  return (
    <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={cn('h-8 w-8 px-0', className)}
          aria-label={`${menuOpened ? 'close' : 'open'} the menu`}
        >
          <MenuIcon className='h-5 w-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>Manage team</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleEditTeam}>
            <PencilIcon className='mr-2 h-4 w-4' />
            <span>Edit team</span>
          </DropdownMenuItem>
          <DeleteTeamDialog team={team} roles={roles} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

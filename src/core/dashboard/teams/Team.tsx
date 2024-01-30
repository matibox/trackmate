import { type $Enums } from '@prisma/client';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar';
import { capitalize } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';
import TeamDropdown from './TeamDropdown';

type Team = RouterOutputs['team']['list'][number];
type Role = $Enums.RosterRole | Exclude<$Enums.TeamRole, 'member'>;

export default function Team({ team }: { team: Team }) {
  const roles = useMemo(() => {
    const roles: Role[] = [];
    team.members.some(m => m.role === 'owner') && roles.push('owner');

    team.rosters.some(r => r.members.some(m => m.role === 'driver')) &&
      roles.push('driver');

    team.rosters.some(r => r.members.some(m => m.role === 'manager')) &&
      roles.push('manager');

    return roles.sort();
  }, [team.members, team.rosters]);

  return (
    <div className='flex w-full items-center gap-4 rounded-md bg-slate-900 p-4 ring-1 ring-slate-800'>
      <Avatar>
        <AvatarImage />
        <AvatarFallback>{team.abbreviation}</AvatarFallback>
      </Avatar>
      <div className='flex flex-col gap-1'>
        <span className='font-semibold leading-none'>{team.name}</span>
        <div className='flex gap-2'>
          {roles.map(role => (
            <Badge key={role} role={role} />
          ))}
        </div>
      </div>
      <TeamDropdown team={team} roles={roles} className='ml-auto' />
    </div>
  );
}

function Badge({ role }: { role: Role }) {
  return (
    <div
      className={`${(() => {
        switch (role) {
          case 'driver':
            return 'bg-emerald-900 text-emerald-200';
          case 'manager':
            return 'bg-amber-900 text-amber-200';
          case 'owner':
            return 'bg-red-900 text-red-200';
        }
      })()} rounded-md px-2 py-0.5 text-sm`}
    >
      {capitalize(role)}
    </div>
  );
}

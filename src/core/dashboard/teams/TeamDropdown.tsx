import { type $Enums } from '@prisma/client';
import { Loader2Icon, MenuIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import { Input } from '~/components/ui/Input';
import { cn } from '~/lib/utils';
import { type RouterOutputs, api } from '~/utils/api';

type Team = RouterOutputs['team']['list'][number];
type Role = $Enums.RosterRole | Exclude<$Enums.TeamRole, 'member'>;

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
        {/* <DropdownMenuLabel>Setups</DropdownMenuLabel>
        <DropdownMenuGroup>
          <AddSetupDialog event={event} />
          <ViewSetupsDialog event={event} />
        </DropdownMenuGroup> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuLabel>Manage team</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PencilIcon className='mr-2 h-4 w-4' />
            <span>Edit team</span>
          </DropdownMenuItem>
          <DeleteTeamDialog team={team} roles={roles} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DeleteTeamDialog({
  team: { name, id: teamId },
  roles,
}: {
  team: Team;
  roles: Role[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [safetyString, setSafetyString] = useState('');

  const utils = api.useContext();
  const { mutateAsync: deleteTeam, isLoading: isDeleteLoading } =
    api.team.delete.useMutation({
      onSuccess: async () => {
        await utils.team.invalidate();
        setDialogOpen(false);
      },
    });

  if (!roles.includes('owner')) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={e => e.preventDefault()}
          className='text-red-500 focus:text-red-500'
        >
          <TrashIcon className='mr-2 h-4 w-4' />
          <span>Delete team</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <div className='flex flex-col gap-4 text-sm text-slate-400'>
            <p>
              This action cannot be undone. All of past and upcoming
              members&apos; events will get deleted. Are you sure you want to
              permanently delete this team? You can instead hand over the
              ownership and then leave.
            </p>
            <div className='flex flex-col gap-2'>
              <p>
                Type{' '}
                <span className='rounded-sm bg-amber-950 px-2 py-0.5 font-mono italic text-amber-200'>
                  {name}
                </span>{' '}
                to continue.
              </p>
              <Input
                className='text-slate-50'
                value={safetyString}
                onChange={e => setSafetyString(e.target.value)}
                onPaste={e => e.preventDefault()}
              />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={isDeleteLoading || safetyString !== name}
            onClick={async () => {
              await deleteTeam({ teamId });
            }}
          >
            {isDeleteLoading ? (
              <>
                Please wait
                <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
              </>
            ) : (
              'Delete team'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

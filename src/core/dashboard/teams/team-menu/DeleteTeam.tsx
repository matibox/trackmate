import { useState } from 'react';
import type { Role, Team } from './TeamDropdown';
import { api } from '~/utils/api';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import { TrashIcon } from 'lucide-react';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';

export default function DeleteTeamDialog({
  team: { name, id: teamId },
  roles,
}: {
  team: Team;
  roles: Role[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [safetyString, setSafetyString] = useState('');

  const utils = api.useUtils();
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
            disabled={safetyString !== name}
            loading={isDeleteLoading}
            onClick={async () => {
              await deleteTeam({ teamId });
            }}
          >
            Delete team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

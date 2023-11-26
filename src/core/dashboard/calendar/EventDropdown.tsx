import { FilePlus, Loader2Icon, MenuIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import { cn } from '~/lib/utils';
import { type RouterOutputs, api } from '~/utils/api';

type Event = RouterOutputs['event']['fromTo'][number]['event'];

export default function EventDropdown({
  event,
  className,
}: {
  event: Event;
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
        <DropdownMenuLabel>Setups</DropdownMenuLabel>
        <DropdownMenuGroup>
          <AddSetupDialog event={event} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Manage event</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DeleteEventDialog event={event} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddSetupDialog({ event: { game } }: { event: Event }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const supportedGames: Array<typeof game> = ['Assetto_Corsa_Competizione'];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!supportedGames.includes(game)}>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <FilePlus className='mr-2 h-4 w-4' />
          <span>Add setup</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add setup</DialogTitle>
          <DialogDescription>Add setup description</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='primary'
            // disabled={isDeleteLoading}
            onClick={() => {
              setDialogOpen(false);
            }}
          >
            {/*//TODO: loading */}
            Add setup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteEventDialog({ event: { id: eventId } }: { event: Event }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const utils = api.useContext();
  const { mutateAsync: deleteEvent, isLoading: isDeleteLoading } =
    api.event.delete.useMutation({
      onSuccess: async () => {
        await utils.event.invalidate();
        setDialogOpen(false);
      },
    });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={e => e.preventDefault()}
          className='text-red-500 focus:text-red-500'
        >
          <TrashIcon className='mr-2 h-4 w-4' />
          <span>Delete setup</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this event?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='destructive'
            disabled={isDeleteLoading}
            onClick={async () => {
              await deleteEvent({ id: eventId });
            }}
          >
            {isDeleteLoading ? (
              <>
                Please wait
                <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
              </>
            ) : (
              'Delete event'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

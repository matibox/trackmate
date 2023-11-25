import { Loader2Icon, MenuIcon, TrashIcon } from 'lucide-react';
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
import { api } from '~/utils/api';

export default function EventDropdown({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);

  const utils = api.useContext();
  const { mutateAsync: deleteEvent, isLoading: isDeleteLoading } =
    api.event.delete.useMutation({
      onSuccess: async () => {
        await utils.event.invalidate();
      },
    });

  return (
    <Dialog open={deleteDialogOpened} onOpenChange={setDeleteDialogOpened}>
      <DropdownMenu
        open={menuOpened}
        onOpenChange={setMenuOpened}
        modal={false}
      >
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
          <DropdownMenuLabel>Event options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DialogTrigger asChild>
              <DropdownMenuItem className='text-red-500 focus:text-red-500'>
                <TrashIcon className='mr-2 h-4 w-4' />
                <span>Delete event</span>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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
              setDeleteDialogOpened(false);
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

import { MenuIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import { cn } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';
import AddSetupDialog from './AddSetup';
import ViewSetupsDialog from './ViewSetups';
import EditEventSheet from './EditEvent';
import DeleteEventDialog from './DeleteEvent';

export type Event = RouterOutputs['event']['fromTo'][number]['event'];

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
          <ViewSetupsDialog event={event} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Manage event</DropdownMenuLabel>
        <DropdownMenuGroup>
          <EditEventSheet event={event} />
          <DeleteEventDialog event={event} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

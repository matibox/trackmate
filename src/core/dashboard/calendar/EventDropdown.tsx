import { zodResolver } from '@hookform/resolvers/zod';
import {
  FilePlus,
  Loader2Icon,
  MenuIcon,
  ShieldCheckIcon,
  TrashIcon,
  UploadIcon,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import { type ReplaceAll, cn } from '~/lib/utils';
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
          <ViewSetupsDialog event={event} />
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

export const addSetupSchema = z.object({
  name: z.string().min(1, 'Setup name is required.'),
  setup: z
    .custom<File>(v => v instanceof File, 'Setup is required.')
    .refine(
      file => file.type === 'application/json',
      'Only .json file is accepted.'
    )
    .refine(file => file.size < 4096, 'File size must be less than 4kb.'),
});

function AddSetupDialog({ event: { id, game, car, track } }: { event: Event }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const supportedGames: Array<typeof game> = ['Assetto_Corsa_Competizione'];

  const form = useForm<z.infer<typeof addSetupSchema>>({
    resolver: zodResolver(addSetupSchema),
    defaultValues: {
      name: '',
      setup: new File([], ''),
    },
  });

  const utils = api.useContext();
  const { mutate: addSetup, isLoading } = api.event.addSetup.useMutation({
    onSuccess: async () => {
      console.log('success');
      await utils.event.invalidate();
      setDialogOpen(false);
    },
  });

  function onSubmit(values: z.infer<typeof addSetupSchema>) {
    const { setup, name } = values;
    const reader = new FileReader();

    reader.addEventListener('load', e => {
      const setupData = e.target?.result;
      if (!setupData) {
        return form.setError('setup', {
          message: 'There was an error while uploading a setup.',
        });
      }

      addSetup({
        eventId: id,
        setupData: JSON.stringify(setupData),
        game: game.replaceAll('_', ' ') as ReplaceAll<typeof game, '_', ' '>,
        name,
        car,
        track,
      });
    });

    reader.readAsText(setup);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!supportedGames.includes(game)}>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <FilePlus className='mr-2 h-4 w-4' />
          <span>Add setup</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <DialogHeader className='text-left'>
              <DialogTitle className='text-center sm:text-left'>
                Add setup
              </DialogTitle>
              <div className='flex flex-col gap-4 text-slate-50'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setup name</FormLabel>
                      <FormControl>
                        <Input type='text' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='setup'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setup</FormLabel>
                      <FormControl>
                        <Input
                          type='file'
                          id='file-input'
                          className='hidden'
                          accept='application/json'
                          onChange={e =>
                            field.onChange(
                              e.target.files ? e.target.files[0] : null
                            )
                          }
                        />
                      </FormControl>
                      <div className='flex items-center gap-4'>
                        <label
                          htmlFor='file-input'
                          className='flex cursor-pointer items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold transition hover:border-slate-700 hover:bg-slate-800'
                        >
                          <UploadIcon className='h-4 w-4' />
                          <span>Upload setup</span>
                        </label>
                        <span className='text-sm text-slate-50'>
                          {field.value.size > 0
                            ? field.value.name
                            : 'No file selected'}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex w-full flex-row gap-4'>
                  <div className='flex items-center self-auto'>
                    <ShieldCheckIcon className='h-6 grow text-sky-400' />
                  </div>
                  <p className='text-sm text-slate-300'>
                    All of the uploaded setups are encrypted. No one, except you
                    and people who you share the setup with can see the setup
                    data.
                  </p>
                </div>
              </div>
            </DialogHeader>
            <DialogFooter>
              <Button type='submit' variant='primary' disabled={isLoading}>
                {isLoading ? (
                  <>
                    Please wait
                    <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
                  </>
                ) : (
                  'Add setup'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ViewSetupsDialog({ event: { id, game } }: { event: Event }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const supportedGames: Array<typeof game> = ['Assetto_Corsa_Competizione'];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!supportedGames.includes(game)}>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <Wrench className='mr-2 h-4 w-4' />
          <span>View setups</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-center sm:text-left'>Setups</DialogTitle>
          <DialogDescription>...setups</DialogDescription>
        </DialogHeader>
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

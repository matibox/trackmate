import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  DownloadIcon,
  FilePlus,
  Loader2Icon,
  MenuIcon,
  PencilIcon,
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
import { Skeleton } from '~/components/ui/Skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import { type ReplaceAll, cn, dateToTimeString } from '~/lib/utils';
import { type RouterOutputs, api } from '~/utils/api';
import { useSetupDownload } from './useSetupDownload';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { useNewEvent } from './new-event/store/newEventStore';

type Event = RouterOutputs['event']['fromTo'][number]['event'];

export default function EventDropdown({
  event,
  className,
}: {
  event: Event;
  className?: string;
}) {
  const [menuOpened, setMenuOpened] = useState(false);
  const { setSheetOpened, setData } = useNewEvent();

  // TODO: add event type to DB
  // TODO: enable step 2 event date before today

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
          <DropdownMenuItem
            onClick={() => {
              setSheetOpened(true);
              setData({ step: '1', data: { eventType: 'single' } });
              setData({
                step: '2-single',
                data: {
                  name: event.name ?? undefined,
                  game:
                    (event.game.replaceAll('_', ' ') as ReplaceAll<
                      typeof event.game,
                      '_',
                      ' '
                    >) ?? undefined,
                  car: event.car ?? undefined,
                  date: undefined,
                  track: event.track ?? undefined,
                },
              });

              const driverIds = [
                ...new Set(
                  event.sessions
                    .map(s => s.drivers)
                    .flat()
                    .map(d => d.id)
                ),
              ];

              setData({
                step: '3-single',
                data: {
                  teamName: event.roster.team.name,
                  rosterId: event.roster.id,
                  driverIds,
                },
              });
            }}
          >
            <PencilIcon className='mr-2 h-4 w-4' />
            <span>Edit event</span>
          </DropdownMenuItem>
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
  const { mutate: addSetup, isLoading } =
    api.event.addAndAssignSetup.useMutation({
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
                        <Input type='text' autoComplete='off' {...field} />
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

function ViewSetupsDialog({ event: { id, name, game } }: { event: Event }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const supportedGames: Array<typeof game> = ['Assetto_Corsa_Competizione'];

  const utils = api.useContext();
  const { data: setups, isLoading } = api.event.getSetups.useQuery(
    { eventId: id },
    {
      enabled: dialogOpen,
    }
  );

  const [currentDeleteSetupId, setCurrentDeleteSetupId] = useState<string>();

  const { mutateAsync: deleteSetup, isLoading: isDeleteLoading } =
    api.setup.delete.useMutation({
      onMutate: ({ setupId }) => setCurrentDeleteSetupId(setupId),
      onSuccess: async () => {
        await utils.event.invalidate();
        await utils.setup.invalidate();
      },
      onSettled: () => setCurrentDeleteSetupId(undefined),
    });

  const {
    download,
    downloadMany,
    isLoading: isDownloadLoading,
    currentDownloadSetupId,
  } = useSetupDownload();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!supportedGames.includes(game)}>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <Wrench className='mr-2 h-4 w-4' />
          <span>View setups</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className='space-y-4 text-left'>
          <DialogTitle className='text-center sm:text-left'>Setups</DialogTitle>
          <ScrollArea className='flex max-h-96 w-full flex-col gap-2'>
            {isLoading
              ? new Array(2).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className='flex w-full justify-between pb-2 last:pb-0'
                  >
                    <div className='flex flex-col justify-center gap-1'>
                      <Skeleton className='h-4 w-12' />
                      <Skeleton className='h-3 w-44' />
                    </div>
                    <div className='flex gap-1'>
                      <Skeleton className='h-[30px] w-[30px]' />
                      <Skeleton className='h-[30px] w-[30px]' />
                    </div>
                  </div>
                ))
              : null}
            {setups?.length === 0 ? (
              <p className='text-center text-slate-300'>No setups found.</p>
            ) : (
              setups?.map(setup => (
                <div
                  key={setup.id}
                  className='flex w-full justify-between border-b border-slate-900 pb-2 last:border-b-0 last:pb-0'
                >
                  <div className='flex flex-col justify-center'>
                    <span className='text-slate-50'>{setup.name}</span>
                    <span className='text-sm text-slate-400'>
                      {dayjs(setup.uploadedAt).format(
                        'DD MMM YYYY [at] HH:mm [by] '
                      )}
                      {setup.uploader.firstName} {setup.uploader.lastName}
                    </span>
                  </div>
                  <div className='flex items-center gap-0.5'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-auto w-auto p-2'
                            aria-label='download setup'
                            disabled={
                              currentDownloadSetupId === setup.id &&
                              isDownloadLoading
                            }
                            onClick={async () => await download({ setup })}
                          >
                            {currentDownloadSetupId === setup.id &&
                            isDownloadLoading ? (
                              <Loader2Icon className='h-4 w-4 animate-spin' />
                            ) : (
                              <DownloadIcon className='h-4 w-4' />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download setup</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-auto w-auto p-2 text-red-500'
                            aria-label='delete setup'
                            disabled={
                              currentDeleteSetupId === setup.id &&
                              isDeleteLoading
                            }
                            onClick={async () => {
                              await deleteSetup({ setupId: setup.id });
                            }}
                          >
                            {currentDeleteSetupId === setup.id &&
                            isDeleteLoading ? (
                              <Loader2Icon className='h-4 w-4 animate-spin' />
                            ) : (
                              <TrashIcon className='h-4 w-4' />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete setup</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
          {setups && setups.length > 0 ? (
            <Button
              variant='positive'
              size='sm'
              className='self-end'
              onClick={() =>
                downloadMany({
                  setups: setups,
                  event: { name },
                })
              }
              disabled={isDownloadLoading || isLoading || isDeleteLoading}
            >
              {isDownloadLoading || isLoading || isDeleteLoading ? (
                <>
                  <span>Please wait</span>
                  <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
                </>
              ) : (
                <>
                  <span>Download all</span>
                  <DownloadIcon className='ml-2 h-4 w-4' />
                </>
              )}
            </Button>
          ) : null}
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
          <span>Delete event</span>
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

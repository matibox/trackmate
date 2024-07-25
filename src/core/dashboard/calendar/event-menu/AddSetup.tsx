import { zodResolver } from '@hookform/resolvers/zod';
import { FilePlus, ShieldCheckIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import { replaceAll } from '~/lib/utils';
import { api } from '~/utils/api';
import { type Event } from './EventDropdown';

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

export default function AddSetupDialog({
  event: { id, game, car, track },
}: {
  event: Event;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const supportedGames: Array<typeof game> = ['Assetto_Corsa_Competizione'];

  const form = useForm<z.infer<typeof addSetupSchema>>({
    resolver: zodResolver(addSetupSchema),
    defaultValues: {
      name: '',
      setup: new File([], ''),
    },
  });

  const utils = api.useUtils();
  const { mutate: addSetup, isLoading } =
    api.event.addAndAssignSetup.useMutation({
      onSuccess: async () => {
        await utils.event.invalidate();
        form.reset();
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
        game: replaceAll(game, '_', ' '),
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
              <Button type='submit' variant='primary' loading={isLoading}>
                Add setup
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

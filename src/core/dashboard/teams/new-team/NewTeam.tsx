import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/Sheet';
import { useNewTeam } from './newTeamStore';
import { Button } from '~/components/ui/Button';
import { PlusIcon, UploadIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';

const acceptedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const newTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required.'),
  abbreviation: z
    .string()
    .min(1, 'Abbreviation is required.')
    .length(3, 'Abbreviation must be 3 characters long.'),
  password: z
    .string()
    .min(1, 'Join password is required.')
    .min(4, 'Join password must be at least 4 characters long.'),
  profilePicture: z
    .custom<File>(v => v instanceof File, 'Team profile picture is required.')
    .refine(file => file.size < 2000000, 'File size must be less than 2MB.')
    .refine(
      file => acceptedImageTypes.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

export default function NewTeam() {
  const { setSheetOpened, sheetOpened, data, setData } = useNewTeam();

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: data?.name ?? '',
      abbreviation: data?.abbreviation ?? '',
      password: data?.password ?? '',
      profilePicture: data?.profilePicture ?? new File([], ''),
    },
  });

  function onSubmit(values: z.infer<typeof newTeamSchema>) {
    setData(values);
    console.log(values);
    // post to backend etc.
  }

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild className='lg:hidden'>
        <Button
          variant='fab'
          size='fab'
          className='fixed bottom-24 right-4'
          aria-label='Create team'
        >
          <PlusIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full border-0 ring-1 ring-slate-900'>
        <SheetHeader>
          <SheetTitle className='text-3xl'>Create team</SheetTitle>
          <SheetDescription>
            Fill team data, click create when you&apos;re ready.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid justify-center gap-4 py-8 text-slate-50'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team name</FormLabel>
                    <FormControl className='w-[278px]'>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='abbreviation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abbreviation</FormLabel>
                    <FormControl className='w-[278px]'>
                      <Input maxLength={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join password</FormLabel>
                    <FormControl className='w-[278px]'>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormDescription>
                      This password will allow members to join your team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='profilePicture'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team picture</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        id='file-input'
                        className='hidden'
                        accept={acceptedImageTypes.join(', ')}
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
                        <span>Upload image</span>
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
            </div>
            <SheetFooter className='mt-auto'>
              <Button type='submit'>Create team</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

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
import { type UseFormReturn, useForm } from 'react-hook-form';
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
import { useEffect } from 'react';
import { api } from '~/utils/api';
import { useToast } from '~/components/ui/useToast';
import { useRouter } from 'next/router';
import { useImageUpload } from '~/hooks/useImageUpload';

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
  password: z.string().optional(),
  profilePicture: z
    .custom<File | null>()
    .optional()
    .refine(
      file => file === null || (file && file?.size < 2000000),
      'File size must be less than 2MB.'
    )
    .refine(
      file => file === null || (file && acceptedImageTypes.includes(file.type)),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

function useTeamMutations({
  form,
}: {
  form: UseFormReturn<z.infer<typeof newTeamSchema>>;
}) {
  const { setSheetOpened, editMode, reset } = useNewTeam();
  const { toast } = useToast();

  const utils = api.useUtils();

  async function onSuccess() {
    await utils.team.invalidate();
    form.reset();
    setSheetOpened(false);
    toast({
      variant: 'default',
      title: 'Success!',
      description: `A team has successfully been ${
        editMode ? 'edited' : 'created'
      }.`,
    });
    reset();
  }

  function onError({ errorMessage }: { errorMessage: string }) {
    toast({
      variant: 'destructive',
      title: 'An error occured.',
      description: errorMessage,
    });
  }

  const { mutateAsync: createTeam, isLoading: isCreateLoading } =
    api.team.create.useMutation({
      onSuccess,
      onError: err => onError({ errorMessage: err.message }),
    });

  const { mutateAsync: editTeam, isLoading: isEditLoading } =
    api.team.edit.useMutation({
      onSuccess,
      onError: err => onError({ errorMessage: err.message }),
    });

  return {
    createTeam,
    editTeam,
    isLoading: isCreateLoading || isEditLoading,
  };
}

export default function NewTeam() {
  const router = useRouter();
  const {
    setSheetOpened,
    sheetOpened,
    data,
    setData,
    editMode,
    editModeTeamId,
    reset,
  } = useNewTeam();

  const { uploadImage, isImageUploading } = useImageUpload();

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(
      newTeamSchema.superRefine(({ password }, ctx) => {
        if (!editMode && (!password || password.length < 4)) {
          ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: 'Join password must be at least 4 characters long.',
          });
        }
      })
    ),
    defaultValues: {
      name: data?.name ?? '',
      abbreviation: data?.abbreviation ?? '',
      password: data?.password ?? '',
      profilePicture: data?.profilePicture ?? null,
    },
  });

  const { createTeam, editTeam, isLoading } = useTeamMutations({ form });

  useEffect(() => {
    if (editMode && data) {
      form.reset({
        name: data.name,
        abbreviation: data.abbreviation,
        password: data.password,
        profilePicture: data.profilePicture ?? null,
      });
    } else if (!editMode) {
      form.reset({
        name: '',
        abbreviation: '',
        password: '',
        profilePicture: null,
      });
    }
  }, [editMode, data, form]);

  useEffect(() => {
    if (!sheetOpened) {
      form.reset({
        name: '',
        abbreviation: '',
        password: '',
        profilePicture: null,
      });
    }
  }, [sheetOpened, form]);

  async function onSubmit(values: z.infer<typeof newTeamSchema>) {
    setData(values);
    let profilePicture: string | undefined = undefined;

    if (values.profilePicture) {
      await uploadImage(values.profilePicture, ({ url }) => {
        profilePicture = url;
      });
    }

    if (editMode) {
      await editTeam({
        ...values,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        teamId: editModeTeamId!,
        profilePicture,
      });
    } else {
      await createTeam({
        ...values,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        password: values.password!,
        profilePicture,
      });
    }
  }

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild className='lg:hidden'>
        {(router.query.t as string | undefined) === 'your-teams' ? (
          <Button
            variant='fab'
            size='fab'
            className='fixed bottom-24 right-4'
            aria-label='Create team'
          >
            <PlusIcon />
          </Button>
        ) : null}
      </SheetTrigger>
      <SheetContent
        className='w-full border-0 ring-1 ring-slate-900'
        onClose={reset}
      >
        <SheetHeader>
          <SheetTitle className='text-3xl'>
            {editMode ? 'Edit' : 'Create'} team
          </SheetTitle>
          <SheetDescription>
            Fill team data, click {editMode ? 'edit' : 'create'} when
            you&apos;re ready.
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
              {!editMode ? (
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Join password</FormLabel>
                      <FormControl className='w-[278px]'>
                        <Input type='password' {...field} />
                      </FormControl>
                      <FormDescription className='w-[278px]'>
                        This password will allow members to join your team.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <FormField
                control={form.control}
                name='profilePicture'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Team picture {!editMode && '(optional)'}
                    </FormLabel>
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
                        {field.value && field.value.size > 0
                          ? field.value.name
                          : 'No file selected'}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className='mx-auto mt-auto w-[278px]'>
              <Button type='submit' loading={isImageUploading || isLoading}>
                {editMode ? 'Edit' : 'Create'} team
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

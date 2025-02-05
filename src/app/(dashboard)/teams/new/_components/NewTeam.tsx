'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { type z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import ResponsiveDialog from '~/components/ui/responsive-dialog';
import { api } from '~/trpc/react';
import { newTeamSchema } from './formSchema';
import { useToast } from '~/hooks/use-toast';
import { useDashboardContext } from '~/app/(dashboard)/_components/DashboardContext';

export default function NewTeam() {
  const router = useRouter();
  const { toast } = useToast();
  const { selectTeam } = useDashboardContext();

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: '',
    },
  });

  const utils = api.useUtils();
  const createTeam = api.team.create.useMutation({
    onError: ({ message }) => {
      // Team name is taken
      if (message.includes('UNIQUE')) {
        form.setError('name', { message: 'Team name is taken.' });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: 'An unknown error occured.',
      });
    },
    onSuccess: async createdTeamId => {
      console.log(createdTeamId);
      await utils.team.ofUser.invalidate();
      await selectTeam(createdTeamId, { refetch: true });
      toast({
        variant: 'default',
        title: 'Success',
        description: 'A team has been created.',
      });
      router.back();
    },
  });

  function onSubmit(values: z.infer<typeof newTeamSchema>) {
    createTeam.mutate(values);
  }

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={open => {
        if (!open) router.back();
      }}
      title="New team"
      description="A team helps you build and manage your racing team effortlessly. Stay ahead of the competition!"
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team name</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="self-end"
            loading={createTeam.status === 'pending'}
          >
            Submit
          </Button>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}

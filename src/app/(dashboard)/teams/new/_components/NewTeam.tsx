'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
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

export const newTeamSchema = z.object({
  name: z
    .string({ required_error: 'Team name is required.' })
    .min(1, 'Team name is required.'),
});

export default function NewTeam() {
  const router = useRouter();

  const form = useForm<z.infer<typeof newTeamSchema>>({
    resolver: zodResolver(newTeamSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof newTeamSchema>) {
    console.log(values);
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
          <Button type="submit" className="self-end">
            Submit
          </Button>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}

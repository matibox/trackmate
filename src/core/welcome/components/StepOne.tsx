import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import { Button } from '~/components/ui/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWelcomeForm } from '../store/formStore';
import WelcomeLayout from './Layout';

const usernameError = 'Username needs to be between 2 and 20 characters';

export const stepOneSchema = z.object({
  username: z.string().min(2, usernameError).max(20, usernameError),
  firstName: z
    .string()
    .min(1, 'First name is required.')
    .max(35, "First name can't be longer than 35 characters."),
  lastName: z
    .string()
    .min(1, 'Last name is required.')
    .max(35, "Last name can't be longer than 35 characters."),
});

export default function StepOne() {
  const { nextStep, setData, stepOne } = useWelcomeForm();

  const form = useForm<z.infer<typeof stepOneSchema>>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: stepOne || {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  function onSubmit(values: z.infer<typeof stepOneSchema>) {
    console.log(values);
    setData({ step: '1', data: values });
    nextStep();
  }

  return (
    <WelcomeLayout
      title='Welcome to TrackMate'
      description='Fill in your data to continue with the app. We use your name only for displaying purposes.'
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full max-w-sm space-y-5'
        >
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Continue</Button>
        </form>
      </Form>
    </WelcomeLayout>
  );
}

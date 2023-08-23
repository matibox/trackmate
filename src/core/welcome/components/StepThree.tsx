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
import { Button } from '~/components/ui/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWelcomeForm } from '../store/formStore';
import WelcomeLayout from './Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';

const createTeamSchema = z.object({
  teamName: z.string({ required_error: 'Team name is required.' }),
  abbreviation: z
    .string()
    .length(3, 'Abbreviation needs to be exactly 3 characters long.'),
  password: z
    .string()
    .min(4, 'Password needs to be at least 4 characters long.'),
});

export default function StepOne() {
  const createTeamForm = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
  });

  function onCreateTeamSubmit(values: z.infer<typeof createTeamSchema>) {
    console.log(values);
  }

  return (
    <WelcomeLayout
      title='Welcome to TrackMate'
      description='Fill in your data to continue with the app. We use your name only for displaying purposes.'
    >
      <Tabs defaultValue='create' className='w-[384px]'>
        <TabsList className='mb-7 grid w-full grid-cols-2 md:mb-9 xl:mb-16'>
          <TabsTrigger value='create'>Create team</TabsTrigger>
          <TabsTrigger value='join'>Join existing team</TabsTrigger>
        </TabsList>
        <TabsContent value='create'>
          <Form {...createTeamForm}>
            <form
              onSubmit={createTeamForm.handleSubmit(onCreateTeamSubmit)}
              className='w-full max-w-sm space-y-5'
            >
              <FormField
                control={createTeamForm.control}
                name='teamName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createTeamForm.control}
                name='abbreviation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abbreviation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>3 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createTeamForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormDescription>
                      Everyone who knows this password will be able to join the
                      team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Create team</Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </WelcomeLayout>
  );
}

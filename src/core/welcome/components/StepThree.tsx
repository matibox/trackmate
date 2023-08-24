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
import WelcomeLayout from './Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const createTeamSchema = z.object({
  teamName: z.string({ required_error: 'Team name is required.' }),
  abbreviation: z
    .string({ required_error: 'Abbreviation is required.' })
    .length(3, 'Abbreviation needs to be exactly 3 characters long.'),
  password: z
    .string()
    .min(4, 'Password needs to be at least 4 characters long.'),
});

export default function StepOne() {
  const [showPassword, setShowPassword] = useState(false);

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
      <Tabs defaultValue='create' className='w-full max-w-sm'>
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
                  <FormItem className='relative'>
                    <FormLabel>Password</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        variant='ghost'
                        size='icon'
                        type='button'
                        className='absolute right-0 top-1/2 -translate-y-1/2 rounded-l-none border-b border-r border-t border-slate-800 bg-slate-950'
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={
                          showPassword ? 'hide password' : 'show password'
                        }
                      >
                        {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                      </Button>
                    </div>
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
        <TabsContent value='join'>
          <div className='text-center'>Coming soon&trade;</div>
        </TabsContent>
      </Tabs>
    </WelcomeLayout>
  );
}

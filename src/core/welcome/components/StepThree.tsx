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
import {
  ArrowLeftIcon,
  Check,
  ChevronsUpDown,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
} from 'lucide-react';
import { useWelcomeForm } from '../store/formStore';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { cn } from '~/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/ui/Command';
import { useDebounce } from '~/hooks/useDebounce';

export const stepThreeCreateTeamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required.'),
  abbreviation: z
    .string({ required_error: 'Abbreviation is required.' })
    .length(3, 'Abbreviation needs to be exactly 3 characters long.'),
  password: z
    .string()
    .min(4, 'Password needs to be at least 4 characters long.'),
});

export const stepThreeJoinTeamSchema = z.object({
  teamName: z.string({ required_error: 'Please select a team.' }),
  password: z.string({ required_error: 'Password is required.' }),
});

export default function StepOne() {
  const {
    stepOne,
    stepTwo,
    stepThreeCreate,
    stepThreeJoin,
    setData,
    previousStep,
  } = useWelcomeForm();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [query, setQuery] = useState('');

  const createTeamForm = useForm<z.infer<typeof stepThreeCreateTeamSchema>>({
    resolver: zodResolver(stepThreeCreateTeamSchema),
    defaultValues: stepThreeCreate || {
      teamName: '',
      abbreviation: '',
      password: '',
    },
  });

  const joinTeamForm = useForm<z.infer<typeof stepThreeJoinTeamSchema>>({
    resolver: zodResolver(stepThreeJoinTeamSchema),
    defaultValues: stepThreeJoin || {
      teamName: '',
      password: '',
    },
  });

  const utils = api.useContext();
  const checkTeamData = api.welcome.isTeamDataTaken.useMutation();
  const checkTeamPassowrd = api.team.checkPassword.useMutation();
  const teamsByQuery = api.team.byQuery.useQuery(
    { q: query },
    { enabled: Boolean(query) }
  );

  useDebounce(
    () => {
      void utils.team.byQuery.invalidate();
    },
    500,
    [query]
  );

  const submitForm = api.welcome.submitForm.useMutation({
    onError: console.log,
    onSuccess: async () => {
      await router.push('/?message=welcome');
    },
  });

  async function onCreateTeamSubmit(
    values: z.infer<typeof stepThreeCreateTeamSchema>
  ) {
    const { isNameTaken, isAbbreviationTaken } =
      await checkTeamData.mutateAsync(values);

    if (isNameTaken) {
      createTeamForm.setError('teamName', {
        message: 'Team name is taken.',
      });
    }

    if (isAbbreviationTaken) {
      createTeamForm.setError('abbreviation', {
        message: 'Abbreviation is taken.',
      });
    }

    if (isNameTaken || isAbbreviationTaken) return;

    setData({ step: '3-create', data: values });

    if (!stepOne || !stepTwo) return;

    await submitForm.mutateAsync({
      stepOne,
      stepTwo,
      stepThreeCreateTeam: values,
      stepThreeJoinTeam: null,
    });
  }

  async function onJoinTeamSubmit(
    values: z.infer<typeof stepThreeJoinTeamSchema>
  ) {
    const success = await checkTeamPassowrd.mutateAsync(values);

    if (!success) {
      return joinTeamForm.setError('password', { message: 'Wrong password.' });
    }

    setData({ step: '3-join', data: values });
    if (!stepOne || !stepTwo) return;

    await submitForm.mutateAsync({
      stepOne,
      stepTwo,
      stepThreeCreateTeam: null,
      stepThreeJoinTeam: values,
    });
  }

  const teamName = joinTeamForm.watch('teamName');

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
              <div className='flex w-full justify-between'>
                <Button
                  variant='secondary'
                  type='button'
                  onClick={previousStep}
                  disabled={submitForm.isLoading}
                >
                  <ArrowLeftIcon className='mr-1.5 h-4 w-4' />
                  Previous
                </Button>
                <Button type='submit' disabled={submitForm.isLoading}>
                  {submitForm.isLoading ? (
                    <>
                      Please wait
                      <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value='join'>
          <Form {...joinTeamForm}>
            <form
              onSubmit={joinTeamForm.handleSubmit(onJoinTeamSubmit)}
              className='w-full max-w-sm space-y-5'
            >
              <FormField
                control={joinTeamForm.control}
                name='teamName'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Team</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild className='px-3'>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? teamsByQuery.data?.find(
                                  team => team.name === field.value
                                )?.name
                              : 'Select team'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='p-0'>
                        <Command>
                          <CommandInput
                            value={query}
                            onValueChange={setQuery}
                            placeholder='Search team...'
                          />
                          <CommandEmpty>
                            {teamsByQuery.isInitialLoading ? (
                              <div className='mx-auto flex justify-center'>
                                <Loader2Icon className='h-4 w-4 animate-spin' />
                              </div>
                            ) : (
                              'No teams found.'
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {teamsByQuery.data?.map(team => (
                              <CommandItem
                                value={team.name}
                                key={team.id}
                                onSelect={() => {
                                  joinTeamForm.setValue('teamName', team.name);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    team.name === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {team.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {Boolean(teamName) ? (
                <FormField
                  control={joinTeamForm.control}
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
                        Everyone who knows this password will be able to join
                        the team.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <div className='flex w-full justify-between'>
                <Button
                  variant='secondary'
                  type='button'
                  onClick={previousStep}
                  disabled={submitForm.isLoading || checkTeamPassowrd.isLoading}
                >
                  <ArrowLeftIcon className='mr-1.5 h-4 w-4' />
                  Previous
                </Button>
                <Button type='submit' disabled={submitForm.isLoading}>
                  {submitForm.isLoading || checkTeamPassowrd.isLoading ? (
                    <>
                      Please wait
                      <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </WelcomeLayout>
  );
}

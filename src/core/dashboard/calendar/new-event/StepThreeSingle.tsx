import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/Button';
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { useNewEvent } from './newEventStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import { api } from '~/utils/api';
import { useEffect, useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import Image from 'next/image';
import { CheckCircleIcon, Loader2Icon } from 'lucide-react';
import { cn } from '~/lib/utils';

export const stepThreeSingleSchema = z.object({
  teamName: z.string({ required_error: 'Team is required.' }),
  rosterId: z.string({ required_error: 'Roster is required.' }),
  driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
});

export default function StepThreeSingle() {
  const { setStep, stepTwoSingle } = useNewEvent();

  const form = useForm<z.infer<typeof stepThreeSingleSchema>>({
    resolver: zodResolver(stepThreeSingleSchema),
    defaultValues: {
      driverIds: [],
    },
  });

  const teamsQuery = api.team.withRostersByGame.useQuery(
    {
      game: stepTwoSingle?.game || 'Assetto Corsa Competizione',
    },
    { enabled: Boolean(stepTwoSingle?.game) }
  );

  const teamSelectDisabled = useMemo(
    () => teamsQuery.isLoading || teamsQuery.data?.length === 1,
    [teamsQuery.data?.length, teamsQuery.isLoading]
  );

  const rosterSelectDisabled = useMemo(() => {
    if (!teamsQuery.data) return true;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return teamSelectDisabled && teamsQuery.data[0]!.rosters.length === 1;
  }, [teamSelectDisabled, teamsQuery.data]);

  function onSubmit(values: z.infer<typeof stepThreeSingleSchema>) {
    console.log(values);
  }

  useEffect(() => {
    if (!teamSelectDisabled) return;
    const teamName = teamsQuery.data?.[0]?.name;
    if (!teamName) return;
    form.setValue('teamName', teamName);
  }, [form, teamSelectDisabled, teamsQuery.data]);

  useEffect(() => {
    if (!rosterSelectDisabled) return;
    const rosterId = teamsQuery.data?.[0]?.rosters?.[0]?.id;
    if (!rosterId) return;
    form.setValue('rosterId', rosterId);
  }, [form, rosterSelectDisabled, teamsQuery.data]);

  const teamName = form.watch('teamName');
  const rosterId = form.watch('rosterId');

  useEffect(() => {
    form.resetField('rosterId');
    form.resetField('driverIds');
  }, [form, teamName]);

  useEffect(() => {
    form.resetField('driverIds');
  }, [form, rosterId]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create single event</SheetTitle>
        <SheetDescription>
          Choose drivers, click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid justify-center gap-4 py-8 text-slate-50'>
            {teamsQuery.isLoading ? (
              <div className='flex w-full justify-center'>
                <Loader2Icon className='h-4 w-4 animate-spin' />
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name='teamName'
                  render={({ field }) => (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormItem className='flex flex-col'>
                            <FormLabel>Team</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={teamSelectDisabled}
                            >
                              <FormControl className='w-[278px]'>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select team' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teamsQuery.data?.map(team => (
                                  <SelectItem key={team.id} value={team.name}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        </TooltipTrigger>
                        <TooltipContent
                          sideOffset={-24}
                          hidden={!teamSelectDisabled}
                        >
                          <p>You are a member of only 1 team.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                />
                {teamName && teamsQuery.data && !rosterSelectDisabled ? (
                  <FormField
                    control={form.control}
                    name='rosterId'
                    render={({ field }) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FormItem className='flex flex-col'>
                              <FormLabel>Roster</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={rosterSelectDisabled}
                              >
                                <FormControl className='w-[278px]'>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select roster' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teamsQuery.data
                                    .find(t => t.name === teamName)
                                    ?.rosters.map(roster => (
                                      <SelectItem
                                        key={roster.id}
                                        value={roster.id}
                                      >
                                        {roster.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          </TooltipTrigger>
                          <TooltipContent
                            sideOffset={-24}
                            hidden={!rosterSelectDisabled}
                          >
                            <p>You are a member of only 1 roster.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  />
                ) : null}
                {teamName && rosterId && teamsQuery.data ? (
                  <FormField
                    control={form.control}
                    name='driverIds'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Drivers</FormLabel>
                        {teamsQuery.data
                          .find(t => t.name === teamName)
                          ?.rosters.find(r => r.id === rosterId)
                          ?.members.map(member => {
                            const isActive = field.value.includes(
                              member.user.id
                            );

                            return (
                              <button
                                key={member.user.id}
                                type='button'
                                className={cn(
                                  'flex w-full items-center gap-2 rounded-md bg-slate-950 px-3.5 py-2 ring-1 ring-slate-800 transition hover:bg-slate-900 hover:ring-slate-700',
                                  {
                                    'bg-slate-900': isActive,
                                  }
                                )}
                                onClick={() => {
                                  const prev = form.getValues('driverIds');
                                  if (isActive) {
                                    form.setValue(
                                      'driverIds',
                                      prev.filter(id => id !== member.user.id)
                                    );
                                  } else {
                                    form.setValue('driverIds', [
                                      ...prev,
                                      member.user.id,
                                    ]);
                                  }
                                }}
                              >
                                <div className='flex h-[11px] w-[17px] items-center justify-center'>
                                  <Image
                                    src={`/flags/${
                                      member.user.profile?.country ?? ''
                                    }.svg`}
                                    alt={''}
                                    width={17}
                                    height={11}
                                    className='object-cover'
                                  />
                                </div>
                                <div>
                                  <span>
                                    {member.user.firstName
                                      ?.slice(0, 1)
                                      .toUpperCase()}
                                    .
                                  </span>
                                  <span> {member.user.lastName}</span>
                                </div>
                                <CheckCircleIcon
                                  className={cn(
                                    'ml-auto h-4 w-4 text-sky-500 opacity-0 transition-opacity',
                                    {
                                      'opacity-100': isActive,
                                    }
                                  )}
                                />
                              </button>
                            );
                          })}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                <SheetFooter className='flex-row justify-between sm:justify-between'>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type='submit'>Next</Button>
                </SheetFooter>
              </>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}

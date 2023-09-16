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
import { countries, games } from '~/lib/constants';
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

export const stepThreeSingleSchema = z.object({
  teamName: z.string({ required_error: 'Team is required' }),
  // roster: z.object({ id: z.string(), name: z.string(), game: z.enum(games) }),
  // drivers: z.array(
  //   z.object({ id: z.string(), name: z.string(), country: z.enum(countries) })
  // ),
});

export default function StepThreeSingle() {
  const { setStep } = useNewEvent();

  const form = useForm<z.infer<typeof stepThreeSingleSchema>>({
    resolver: zodResolver(stepThreeSingleSchema),
  });

  const teamsQuery = api.team.memberOfWithRosters.useQuery();

  function onSubmit(values: z.infer<typeof stepThreeSingleSchema>) {
    console.log(values);
  }

  const teamSelectDisabled = useMemo(
    () => teamsQuery.isLoading || teamsQuery.data?.length === 1,
    [teamsQuery.data?.length, teamsQuery.isLoading]
  );

  useEffect(() => {
    console.log('I ran');
    if (!teamSelectDisabled) return;
    const teamName = teamsQuery.data?.[0]?.name;
    if (!teamName) return;
    form.setValue('teamName', teamName);
  }, [form, teamSelectDisabled, teamsQuery.data]);

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
                    <TooltipContent sideOffset={-24}>
                      <p>You are a member of only 1 team.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            />
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
          </div>
        </form>
      </Form>
    </>
  );
}

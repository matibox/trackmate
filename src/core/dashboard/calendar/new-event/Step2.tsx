import { z } from 'zod';
import { useFormContext } from 'react-hook-form';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import {
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
import { type stepOneSchema } from './Step1';
import DriverButton from './DriverButton';
import { Loader2Icon } from 'lucide-react';

export const stepTwoSchema = z.object({
  teamId: z
    .string({ required_error: 'Team is required.' })
    .min(1, 'Team is required.'),
  rosterId: z
    .string({ required_error: 'Roster is required.' })
    .min(1, 'Roster is required.'),
  driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
});

export default function StepTwo() {
  const { watch: getStepOne } = useFormContext<z.infer<typeof stepOneSchema>>();
  const form = useFormContext<z.infer<typeof stepTwoSchema>>();

  const { data: teams, status: teamStatus } = api.team.memberOf.useQuery();
  const { data: rosters, status: rosterStatus } =
    api.team.rostersByGame.useQuery(
      { teamId: form.watch('teamId'), game: getStepOne('game') },
      { enabled: !!form.watch('teamId') }
    );
  const { data: drivers, status: driversStatus } = api.roster.drivers.useQuery(
    { rosterId: form.watch('rosterId') },
    { enabled: !!form.watch('teamId') && !!form.watch('rosterId') }
  );

  // console.log(form.getValues());

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create an event</SheetTitle>
        <SheetDescription>
          Choose a team and drivers, click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <div className='mx-auto flex w-4/5 flex-col gap-4 py-8 text-slate-50'>
        <FormField
          control={form.control}
          name='teamId'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Team</FormLabel>
              <Select
                onValueChange={e => {
                  field.onChange(e);
                  form.resetField('rosterId', { defaultValue: '' });
                  // form.resetField('driverIds', { defaultValue: [] });
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select team' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teams?.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='rosterId'
          render={({ field }) =>
            form.watch('teamId') ? (
              <FormItem className='flex flex-col'>
                <FormLabel>Roster</FormLabel>
                <Select
                  onValueChange={e => {
                    field.onChange(e);
                    form.resetField('driverIds', { defaultValue: [] });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select roster' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rosters?.map(roster => (
                      <SelectItem key={roster.id} value={roster.id}>
                        {roster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            ) : (
              <></>
            )
          }
        />
        <FormField
          control={form.control}
          name='driverIds'
          render={({ field }) =>
            form.watch('rosterId') ? (
              <FormItem className='flex flex-col'>
                <FormLabel>Drivers</FormLabel>
                {driversStatus === 'loading' && (
                  <Loader2Icon className='mx-auto h-4 w-4 animate-spin' />
                )}
                {drivers?.map(({ user }) => {
                  // console.log(field.value);
                  const isActive = field.value.includes(user.id);

                  return (
                    <DriverButton
                      key={user.id}
                      driver={user}
                      isActive={isActive}
                      onClick={() => {
                        const prev = field.value;
                        if (isActive) {
                          form.setValue(
                            'driverIds',
                            prev.filter(id => id !== user.id)
                          );
                        } else {
                          form.setValue('driverIds', [...prev, user.id]);
                        }
                      }}
                    />
                  );
                })}
                <FormMessage />
              </FormItem>
            ) : (
              <></>
            )
          }
        />
      </div>
    </>
  );
}

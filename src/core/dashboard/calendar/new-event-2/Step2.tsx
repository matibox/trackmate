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

export const stepTwoSchema = z.object({
  teamId: z
    .string({ required_error: 'Team is required.' })
    .min(1, 'Team is required.'),
  rosterId: z
    .string({ required_error: 'Roster is required.' })
    .min(1, 'Roster is required.'),
  driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
});

// ! Placeholder
// TODO: fetch from DB
const teams = ['A', 'B', 'C'];
const rosters = ['A', 'B', 'C'];
// const drivers = ['abc', 'def', 'ghi'];

export default function StepTwo() {
  const form = useFormContext<z.infer<typeof stepTwoSchema>>();

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
                  {teams.map(team => (
                    <SelectItem key={team} value={team}>
                      {team}
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
                    {rosters.map(roster => (
                      <SelectItem key={roster} value={roster}>
                        {roster}
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
      </div>
    </>
  );
}

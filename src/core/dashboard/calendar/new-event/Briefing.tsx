import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import { Calendar } from '~/components/ui/Calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { cn } from '~/lib/utils';

export const briefingSchema = z.object({
  type: z.literal('briefing'),
  date: z.date({ required_error: 'Date is required.' }),
  startTime: z
    .string({ required_error: 'Start time is required.' })
    .min(1, 'Start time is required.'),
});

export default function Briefing() {
  const form = useFormContext<z.infer<typeof briefingSchema>>();

  return (
    <>
      <FormField
        control={form.control}
        name='date'
        render={({ field }) => (
          <FormItem className='flex flex-col'>
            <FormLabel className='w-min'>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      dayjs(field.value).format('MMMM DD, YYYY')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='startTime'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start time</FormLabel>
            <FormControl>
              <Input {...field} type='time' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { eventTypes } from '~/lib/constants';
import { Button } from '~/components/ui/Button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { useNewEvent } from './newEventStore';
import { Input } from '~/components/ui/Input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { cn } from '~/lib/utils';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '~/components/ui/Calendar';

export const stepTwoSingleSchema = z.object({
  name: z
    .string({ required_error: 'Event name is required.' })
    .min(1, 'Event name is required.'),
  date: z.date({ required_error: 'Event date is required.' }),
  // car: z.string(),
  // track: z.string(),
});

export default function StepTwoSingle() {
  const { setData } = useNewEvent();

  const form = useForm<z.infer<typeof stepTwoSingleSchema>>({
    resolver: zodResolver(stepTwoSingleSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: z.infer<typeof stepTwoSingleSchema>) {
    console.log(values);
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create single event</SheetTitle>
        <SheetDescription>
          Fill basic event data, click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid justify-center gap-4 py-8 text-slate-50'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event name</FormLabel>
                  <FormControl className='w-[278px]'>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex w-[278px] flex-col'>
                  <FormLabel>Date</FormLabel>
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
                        disabled={date =>
                          date <
                          new Date(
                            dayjs().year(),
                            dayjs().month(),
                            dayjs().date()
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    If some part of an event is held on a different day than the
                    race, put in a date the race is held on.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type='submit' className='self-end'>
                Next
              </Button>
            </SheetFooter>
          </div>
        </form>
      </Form>
    </>
  );
}

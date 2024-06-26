import { z } from 'zod';
import ServerSettings, { serverInfoSchema } from './ServerSettings';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import { AlertTriangleIcon, CalendarIcon, Settings2Icon } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/utils';
import dayjs from 'dayjs';
import { Calendar } from '~/components/ui/Calendar';
import { Input } from '~/components/ui/Input';
import { useIsFieldsError } from '~/hooks/useIsFieldsError';

export const practiceSchema = z
  .object({
    type: z.literal('practice'),
    date: z.date({ required_error: 'Date is required.' }),
    startTime: z
      .string({ required_error: 'Start time is required.' })
      .min(1, 'Start time is required.'),
    endTime: z
      .string({ required_error: 'End time is required.' })
      .min(1, 'End time is required.'),
  })
  .merge(serverInfoSchema);

export default function Practice() {
  const form = useFormContext<z.infer<typeof practiceSchema>>();

  const { isError } = useIsFieldsError(form.formState.errors, [
    'date',
    'startTime',
    'endTime',
  ]);

  return (
    <Tabs defaultValue='basic-info' className='flex flex-col gap-4'>
      <TabsList className='flex w-full bg-transparent p-0'>
        <TabsTrigger
          value='basic-info'
          className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
        >
          {isError ? (
            <AlertTriangleIcon className='h-4 w-4 text-red-500' />
          ) : (
            <Settings2Icon className='h-4 w-4' />
          )}
          Basic info
        </TabsTrigger>
        <TabsTrigger
          value='server-info'
          className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
        >
          <ServerSettings.Trigger />
        </TabsTrigger>
      </TabsList>
      <TabsContent value='basic-info'>
        <div className='flex flex-col gap-4'>
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
          <FormField
            control={form.control}
            name='endTime'
            render={({ field }) => (
              <FormItem>
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <Input {...field} type='time' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
      <TabsContent value='server-info'>
        <ServerSettings.Content />
      </TabsContent>
    </Tabs>
  );
}

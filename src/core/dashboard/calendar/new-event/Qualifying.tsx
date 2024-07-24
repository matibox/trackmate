import { z } from 'zod';
import ServerSettings, { serverInfoSchema } from './ServerSettings';
import Weather, { weatherSchema } from './Weather';
import { type UseFormReturn, useFormContext } from 'react-hook-form';
import { type stepTwoSchema } from './Step2';
import { api } from '~/utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/Tabs';
import {
  AlertTriangleIcon,
  CalendarIcon,
  Loader2Icon,
  Settings2Icon,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import Flag from '~/components/Flag';
import { useIsFieldsError } from '~/hooks/useIsFieldsError';

export const qualifyingSchema = z
  .object({
    type: z.literal('qualifying'),
    date: z.date({ required_error: 'Date is required.' }),
    startTime: z
      .string({ required_error: 'Start time is required.' })
      .min(1, 'Start time is required.'),
    endTime: z
      .string({ required_error: 'End time is required.' })
      .min(1, 'End time is required.'),
    driverId: z
      .string({ required_error: 'Choose a driver.' })
      .min(1, 'Choose a driver.'),
  })
  .merge(serverInfoSchema)
  .merge(weatherSchema);

export default function Qualifying({
  stepTwoForm,
}: {
  stepTwoForm: UseFormReturn<z.infer<typeof stepTwoSchema>>;
}) {
  const form = useFormContext<z.infer<typeof qualifyingSchema>>();
  const driverIds = stepTwoForm.getValues('driverIds');

  const { data: drivers, status } = api.user.byId.useQuery(
    { memberIds: driverIds },
    { enabled: !!driverIds }
  );

  const { isError } = useIsFieldsError(form.formState.errors, [
    'date',
    'startTime',
    'endTime',
    'driverId',
  ]);

  return (
    <>
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
          <TabsTrigger
            value='weather'
            className='flex grow items-center gap-2 px-0 data-[state=active]:border-b data-[state=active]:border-sky-400'
          >
            <Weather.Trigger />
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
            <FormField
              control={form.control}
              name='driverId'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Driver</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select driver' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-96'>
                      {status === 'loading' && (
                        <div className='flex justify-center py-2'>
                          <Loader2Icon className='h-5 w-5 animate-spin text-slate-300' />
                        </div>
                      )}
                      {drivers?.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className='flex items-center gap-2'>
                            <Flag country={driver.profile?.country} />
                            <span>
                              {driver.firstName?.charAt(0).toUpperCase()}
                              {'. '}
                              {driver.lastName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
        <TabsContent value='server-info'>
          <ServerSettings.Content />
        </TabsContent>
        <TabsContent value='weather'>
          <Weather.Content />
        </TabsContent>
      </Tabs>
    </>
  );
}

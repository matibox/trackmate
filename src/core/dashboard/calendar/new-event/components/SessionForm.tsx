import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ChevronDown, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
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
import { ScrollArea } from '~/components/ui/ScrollArea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import { sessionTypes } from '~/lib/constants';
import { capitalize, cn, timeStringToDate } from '~/lib/utils';
import FormCondition from './FormCondition';
import { Checkbox } from '~/components/ui/Checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import dayjs from 'dayjs';
import { Calendar } from '~/components/ui/Calendar';
import { useNewEvent } from '../store/newEventStore';
import { api } from '~/utils/api';
import Flag from '~/components/Flag';
import DriverButton from './DriverButton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/Collapsible';

const serverInfoSchema = z
  .object({
    inGameTime: z.string().optional(),
    serverName: z.string().optional(),
    serverPassword: z.string().optional(),
  })
  .optional();

const weatherSchema = z
  .object({
    rainLevel: z.string().optional(),
    cloudLevel: z.string().optional(),
    randomness: z.string().optional(),
    ambientTemp: z.string().optional(),
  })
  .optional();

export const sessionSchema = z
  .discriminatedUnion(
    'type',
    [
      // PRACTICE
      z.object({
        type: z.literal('practice'),
        end: z
          .string({ required_error: 'End time is required.' })
          .min(1, 'End time is required.'),
        serverInformation: serverInfoSchema,
      }),
      // BRIEFING
      z.object({
        type: z.literal('briefing'),
        customDay: z.date().optional(),
      }),
      // QUALIFYING
      z.object({
        type: z.literal('qualifying'),
        end: z
          .string({ required_error: 'End time is required.' })
          .min(1, 'End time is required.'),
        driverId: z
          .string({ required_error: 'Driver is required.' })
          .min(1, 'Driver is required.'),
        customDay: z.date().optional(),
        serverInformation: serverInfoSchema,
        weather: weatherSchema,
      }),
      // RACE
      z.object({
        type: z.literal('race'),
        end: z
          .string({ required_error: 'End time is required.' })
          .min(1, 'End time is required.'),
        driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
        endsNextDay: z.boolean().default(false),
        serverInformation: serverInfoSchema,
        weather: weatherSchema,
      }),
    ],
    {
      errorMap: (issue, ctx) => {
        if (issue.code === 'invalid_union_discriminator') {
          return {
            message: 'Session type is required.',
          };
        }
        return { message: ctx.defaultError };
      },
    }
  )
  .and(
    z.object({
      id: z.string().optional(),
      start: z
        .string({ required_error: 'Start time is required.' })
        .min(1, 'Start time is required.'),
      date: z.date({ required_error: 'Date is required' }),
    })
  )
  .superRefine((schema, ctx) => {
    if (!('end' in schema) || !('endsNextDay' in schema)) return;

    const start = timeStringToDate(schema.start);
    const end = timeStringToDate(schema.end);

    if (end.isBefore(start) && !schema.endsNextDay) {
      ctx.addIssue({
        code: 'custom',
        fatal: true,
        message: 'End time must be after start time.',
        path: ['end'],
      });
    }
  });

export default function SessionForm({
  loading = false,
  addSession,
}: {
  loading?: boolean;
  addSession: (session: z.infer<typeof sessionSchema>) => void;
}) {
  const [sessionFormOpen, setSessionFormOpen] = useState(false);

  const {
    steps: { stepThreeSingle },
  } = useNewEvent();

  const driversQuery = api.user.byId.useQuery({
    memberIds: stepThreeSingle?.driverIds,
  });

  const sessionForm = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      driverIds: [],
      start: '',
      end: '',
      serverInformation: {
        inGameTime: '',
        serverName: '',
        serverPassword: '',
      },
      weather: {
        rainLevel: '',
        cloudLevel: '',
        randomness: '',
        ambientTemp: '',
      },
    },
  });

  function onSessionSubmit(values: z.infer<typeof sessionSchema>) {
    addSession(values);
    sessionForm.reset({
      driverId: '',
      driverIds: [],
      start: '',
      end: '',
      serverInformation: {
        inGameTime: '',
        serverName: '',
        serverPassword: '',
      },
      weather: {
        rainLevel: '',
        cloudLevel: '',
        randomness: '',
        ambientTemp: '',
      },
    });
    setSessionFormOpen(false);
  }

  const sessionType = sessionForm.watch('type');

  useEffect(() => {
    sessionForm.resetField('serverInformation');
  }, [sessionType, sessionForm]);

  return (
    <Dialog open={sessionFormOpen} onOpenChange={setSessionFormOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='secondary'
          className='w-[278px] justify-between'
          disabled={loading}
        >
          New session
          <PlusIcon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='text-slate-50 sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-xl leading-none'>
            Create a session
          </DialogTitle>
          <DialogDescription>
            Insert session details here. Click create when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...sessionForm}>
          <form
            onSubmit={sessionForm.handleSubmit(onSessionSubmit)}
            className='flex flex-col gap-5'
          >
            <ScrollArea className='max-h-[calc(100vh_-_20rem)] md:max-h-[calc(100vh_-_15rem)]'>
              <div className='flex flex-col gap-5 p-1'>
                <FormField
                  control={sessionForm.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Session type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select session type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-h-96'>
                          {sessionTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {capitalize(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {sessionType ? (
                  <>
                    <FormField
                      control={sessionForm.control}
                      name='date'
                      render={({ field }) => (
                        <FormItem className='flex w-full flex-col'>
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
                            <PopoverContent
                              className='w-auto p-0'
                              align='start'
                            >
                              <Calendar
                                mode='single'
                                selected={field.value}
                                onSelect={field.onChange}
                                weekStartsOn={1}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sessionForm.control}
                      name='start'
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
                ) : null}
                <FormCondition
                  type='sessions'
                  sessions={['practice', 'qualifying', 'race']}
                  currentSession={sessionType}
                >
                  <FormField
                    control={sessionForm.control}
                    name='end'
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
                </FormCondition>
                <FormCondition
                  type='sessions'
                  sessions={['race']}
                  currentSession={sessionType}
                >
                  <FormField
                    control={sessionForm.control}
                    name='endsNextDay'
                    render={({ field }) => (
                      <FormItem className='flex space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='grid gap-1.5'>
                          <FormLabel className='!text-sm !leading-none'>
                            Ends next day
                          </FormLabel>
                          <FormDescription className='!text-sm'>
                            This option is useful i.e. in 24h races.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </FormCondition>
                <FormCondition
                  type='sessions'
                  sessions={['qualifying']}
                  currentSession={sessionType}
                >
                  <FormField
                    control={sessionForm.control}
                    name='driverId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Driver</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select driver' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-96'>
                            {driversQuery.data?.map(driver => (
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
                </FormCondition>
                <FormCondition
                  type='sessions'
                  sessions={['race']}
                  currentSession={sessionType}
                >
                  <FormField
                    control={sessionForm.control}
                    name='driverIds'
                    render={({ field }) => (
                      <FormItem className='relative flex max-h-72 flex-col overflow-y-scroll scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500'>
                        <FormLabel>Drivers</FormLabel>
                        <div className='flex flex-col gap-2 p-px'>
                          {driversQuery.data?.map(driver => {
                            const isActive = field.value.includes(driver.id);
                            return (
                              <DriverButton
                                key={driver.id}
                                driver={driver}
                                isActive={isActive}
                                onClick={() => {
                                  const prev =
                                    sessionForm.getValues('driverIds');
                                  if (isActive) {
                                    sessionForm.setValue(
                                      'driverIds',
                                      prev.filter(id => id !== driver.id)
                                    );
                                  } else {
                                    sessionForm.setValue('driverIds', [
                                      ...prev,
                                      driver.id,
                                    ]);
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormCondition>
              </div>
              <FormCondition
                type='both'
                sessions={['practice', 'qualifying', 'race']}
                currentSession={sessionType}
                games={['Assetto Corsa Competizione']}
              >
                <Collapsible className='mt-5'>
                  <CollapsibleTrigger className='group flex items-center gap-2 [&[data-state=open]>svg]:rotate-180'>
                    <ChevronDown className='h-4 w-4 transition-transform duration-200' />
                    <span className='text-sm font-medium'>
                      Server information
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='flex flex-col gap-5 px-1 py-2'>
                    <FormField
                      control={sessionForm.control}
                      name='serverInformation.inGameTime'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>In-game time</FormLabel>
                          <FormControl>
                            <Input {...field} type='time' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sessionForm.control}
                      name='serverInformation.serverName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server name</FormLabel>
                          <FormControl>
                            <Input {...field} type='text' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sessionForm.control}
                      name='serverInformation.serverPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server password</FormLabel>
                          <FormControl>
                            <Input {...field} type='text' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </FormCondition>
              <FormCondition
                type='both'
                sessions={['qualifying', 'race']}
                currentSession={sessionType}
                games={['Assetto Corsa Competizione']}
              >
                <Collapsible>
                  <CollapsibleTrigger className='group flex items-center gap-2 [&[data-state=open]>svg]:rotate-180'>
                    <ChevronDown className='h-4 w-4 transition-transform duration-200' />
                    <span className='text-sm font-medium'>Weather</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='flex flex-col gap-5 px-1 py-2'>
                    <FormField
                      control={sessionForm.control}
                      name='weather.rainLevel'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rain level</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </FormControl>
                          <FormDescription className='!text-sm'>
                            Between 0 and 1
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sessionForm.control}
                      name='weather.cloudLevel'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cloud level</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </FormControl>
                          <FormDescription className='!text-sm'>
                            Between 0 and 1
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sessionForm.control}
                      name='weather.randomness'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Randomness</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              min={0}
                              max={7}
                              step={1}
                            />
                          </FormControl>
                          <FormDescription className='!text-sm'>
                            Between 0 and 7
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sessionForm.control}
                      name='weather.ambientTemp'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='number'
                              min={10}
                              max={45}
                              step={1}
                            />
                          </FormControl>
                          <FormDescription className='!text-sm'>
                            Between 10 and 45
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </FormCondition>
            </ScrollArea>
            <DialogFooter>
              <Button type='submit' disabled={loading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

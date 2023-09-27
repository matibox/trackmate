/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/Button';
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { useNewEvent } from '../store/newEventStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import { sessionTypes } from '~/lib/constants';
import { Input } from '~/components/ui/Input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { api } from '~/utils/api';
import { capitalize, cn, timeStringToDate } from '~/lib/utils';
import { useEffect, useState } from 'react';
import crypto from 'crypto';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import DriverButton from './DriverButton';
import { Checkbox } from '~/components/ui/Checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import dayjs from 'dayjs';
import { Calendar } from '~/components/ui/Calendar';
import Flag from '~/components/Flag';
import { useRouter } from 'next/router';

const sessionSchema = z
  .discriminatedUnion(
    'type',
    [
      // PRACTICE
      z.object({
        type: z.literal('practice'),
        end: z
          .string({ required_error: 'End time is required.' })
          .min(1, 'End time is required.'),
        customDay: z.date().optional(),
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
      }),
      // RACE
      z.object({
        type: z.literal('race'),
        end: z
          .string({ required_error: 'End time is required.' })
          .min(1, 'End time is required.'),
        driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
        endsNextDay: z.boolean().default(false),
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
      start: z
        .string({ required_error: 'Start time is required.' })
        .min(1, 'Start time is required.'),
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

export const stepFourSingleSchema = z.object({
  sessions: z
    .array(sessionSchema.and(z.object({ id: z.string() })))
    .min(1, 'Add at least 1 session.'),
});

export default function StepFourSingle() {
  const {
    setStep,
    setData,
    steps: { stepOne, stepTwoSingle, stepFourSingle, stepThreeSingle },
    setSheetOpened,
  } = useNewEvent();

  const router = useRouter();

  const driversQuery = api.user.byId.useQuery({
    memberIds: stepThreeSingle?.driverIds,
  });

  const utils = api.useContext();
  const createEvent = api.event.create.useMutation({
    onError: console.log,
    onSuccess: async () => {
      await router.push('/calendar?message=createdEvent');
      await utils.event.get.invalidate();
      setSheetOpened(false);
    },
  });

  const form = useForm<z.infer<typeof stepFourSingleSchema>>({
    resolver: zodResolver(stepFourSingleSchema),
    defaultValues: {
      sessions: stepFourSingle?.sessions ?? [],
    },
  });

  async function onSubmit(values: z.infer<typeof stepFourSingleSchema>) {
    console.log(values);
    setData({ step: '4-single', data: values });

    const eventType = stepOne!.eventType!;
    await createEvent.mutateAsync(
      eventType === 'single'
        ? {
            eventType,
            stepTwo: stepTwoSingle!,
            stepThree: stepThreeSingle!,
            stepFour: values,
          }
        : { eventType }
    );
  }

  const [sessionFormOpen, setSessionFormOpen] = useState(false);

  const sessionForm = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      driverIds: [],
      start: '',
      end: '',
    },
  });

  const [isDifferentDay, setIsDifferentDay] = useState(false);

  function onSessionSubmit(values: z.infer<typeof sessionSchema>) {
    const prev = form.getValues('sessions');
    form.setValue('sessions', [
      ...prev,
      { id: crypto.randomBytes(4).toString('hex'), ...values },
    ]);
    sessionForm.reset({
      driverId: '',
      driverIds: [],
      start: '',
      end: '',
    });
    setIsDifferentDay(false);
    setSessionFormOpen(false);
  }

  const sessionType = sessionForm.watch('type');
  useEffect(() => {
    setIsDifferentDay(false);
    sessionForm.resetField('customDay');
  }, [sessionType, sessionForm]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create single event</SheetTitle>
        <SheetDescription>
          Define the race week. Click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <div className='grid justify-center gap-4 py-8 text-slate-50'>
        <Form {...form}>
          <form id='main-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='sessions'
              render={({ field }) => (
                <FormItem>
                  <div className='flex flex-col gap-3.5 p-px'>
                    {field.value
                      .sort((a, b) => {
                        const startA = timeStringToDate(
                          a.start,
                          'customDay' in a
                            ? dayjs(a.customDay)
                            : dayjs(stepTwoSingle?.date)
                        );
                        const startB = timeStringToDate(
                          b.start,
                          'customDay' in b
                            ? dayjs(b.customDay)
                            : dayjs(stepTwoSingle?.date)
                        );

                        if (startA.isBefore(startB)) return -1;
                        if (startA.isAfter(startB)) return 1;
                        return 0;
                      })
                      .map(session => {
                        const day = dayjs(
                          'customDay' in session
                            ? session.customDay
                            : stepTwoSingle?.date
                        );
                        let date = day.format('D MMM, dddd');

                        if ('endsNextDay' in session && session.endsNextDay) {
                          const nextDay = day.add(1, 'day');

                          const nextDayFormat = (
                            day1: dayjs.Dayjs,
                            day2: dayjs.Dayjs,
                            baseTemplate: string,
                            sameTemplate: string
                          ) => {
                            return day1.format(sameTemplate) ===
                              day2.format(sameTemplate)
                              ? day1.format(baseTemplate)
                              : `${day1.format(sameTemplate)}/${day2.format(
                                  sameTemplate
                                )}`;
                          };

                          date = `${day.date()} - ${nextDay.date()} ${nextDayFormat(
                            day,
                            nextDay,
                            'MMMM',
                            'MMM'
                          )}, ${nextDayFormat(day, nextDay, 'dddd', 'ddd')}`;
                        }

                        const sessionsOfType = field.value.filter(
                          s => s.type === session.type
                        );
                        const sessionTypeNumber =
                          sessionsOfType.length > 1
                            ? sessionsOfType.findIndex(
                                s => s.id === session.id
                              ) + 1
                            : 0;

                        const ids =
                          'driverIds' in session
                            ? session.driverIds
                            : 'driverId' in session
                            ? [session.driverId]
                            : [];

                        const drivers = driversQuery.data
                          ? driversQuery.data.filter(d => ids.includes(d.id))
                          : undefined;

                        return (
                          <div
                            key={session.id}
                            className='flex w-full items-center justify-between rounded-md bg-slate-950 px-3.5 py-3 ring-1 ring-slate-800'
                          >
                            <div className='flex flex-col gap-3'>
                              <div className='flex flex-col gap-1.5'>
                                <span className='font-medium leading-none'>
                                  {capitalize(session.type)}{' '}
                                  {sessionTypeNumber === 0
                                    ? ''
                                    : sessionTypeNumber}
                                </span>
                                <span className='text-sm leading-none text-slate-400'>
                                  {date}
                                </span>
                                <span className='text-sm leading-none text-slate-400'>
                                  {session.start}{' '}
                                  {'end' in session ? ` - ${session.end}` : ''}
                                </span>
                              </div>
                              {drivers && drivers.length > 0 ? (
                                <div className='flex gap-2'>
                                  <UsersIcon className='h-4 w-4 shrink-0' />
                                  <span className='text-sm leading-none'>
                                    {drivers
                                      .map(
                                        d =>
                                          `${
                                            d.firstName
                                              ?.charAt(0)
                                              .toUpperCase() ?? ''
                                          }. ${d.lastName ?? ''}`
                                      )
                                      .join(', ')}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    aria-label='Remove session'
                                    onClick={() => {
                                      const prev = form.getValues('sessions');
                                      form.setValue(
                                        'sessions',
                                        prev.filter(s => s.id !== session.id)
                                      );
                                    }}
                                    disabled={createEvent.isLoading}
                                  >
                                    <Trash2Icon className='h-[18px] w-[18px] text-red-500' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Remove {session.type}{' '}
                                    {sessionTypeNumber === 0
                                      ? ''
                                      : sessionTypeNumber}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        );
                      })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <Dialog open={sessionFormOpen} onOpenChange={setSessionFormOpen}>
          <DialogTrigger asChild>
            <Button
              type='button'
              variant='secondary'
              className='w-[278px] justify-between'
              disabled={createEvent.isLoading}
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
              <form onSubmit={sessionForm.handleSubmit(onSessionSubmit)}>
                <div className='flex flex-col gap-5'>
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
                  ) : null}
                  {['practice', 'qualifying', 'race'].includes(sessionType) ? (
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
                  ) : null}
                  {sessionType === 'race' ? (
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
                  ) : null}
                  {['briefing', 'practice', 'qualifying'].includes(
                    sessionType
                  ) ? (
                    <div className='flex space-x-2'>
                      <Checkbox
                        id='different-day'
                        checked={isDifferentDay}
                        onCheckedChange={() => setIsDifferentDay(prev => !prev)}
                      />
                      <div className='grid gap-1.5 leading-none'>
                        <label
                          htmlFor='different-day'
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          Different day session
                        </label>
                        <p className='text-sm text-slate-400'>
                          Check this if {sessionType} is on different day than
                          race.
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {isDifferentDay ? (
                    <FormField
                      control={sessionForm.control}
                      name='customDay'
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
                            <PopoverContent
                              className='w-auto p-0'
                              align='start'
                            >
                              <Calendar
                                mode='single'
                                selected={field.value}
                                onSelect={field.onChange}
                                weekStartsOn={1}
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                disabled={date => date >= stepTwoSingle!.date}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                  {sessionType === 'qualifying' ? (
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
                                      {driver.firstName
                                        ?.charAt(0)
                                        .toUpperCase()}
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
                  ) : null}
                  {sessionType === 'race' ? (
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
                  ) : null}
                  <DialogFooter>
                    <Button type='submit' disabled={createEvent.isLoading}>
                      Create
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <SheetFooter className='flex-row justify-between sm:justify-between'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => setStep('3-single')}
            disabled={createEvent.isLoading}
          >
            Back
          </Button>
          <Button
            type='submit'
            form='main-form'
            disabled={createEvent.isLoading}
          >
            {createEvent.isLoading ? (
              <>
                Please wait
                <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
              </>
            ) : (
              'Create event'
            )}
          </Button>
        </SheetFooter>
      </div>
    </>
  );
}

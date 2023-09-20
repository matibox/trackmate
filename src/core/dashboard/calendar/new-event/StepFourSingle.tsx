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
import { PlusIcon, Trash2Icon } from 'lucide-react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { api } from '~/utils/api';
import Image from 'next/image';
import { capitalize, timeStringToDate } from '~/lib/utils';
import { useState } from 'react';
import crypto from 'crypto';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import DriverButton from './components/DriverButton';

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
      }),
      // BRIEFING
      z.object({
        type: z.literal('briefing'),
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
      }),
      // RACE
      z.object({
        type: z.literal('race'),
        end: z
          .string({ required_error: 'End time is required.' })
          .min(1, 'End time is required.'),
        driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
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
    if (!('end' in schema)) return;

    const start = timeStringToDate(schema.start);
    const end = timeStringToDate(schema.end);

    if (end.isBefore(start)) {
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
    steps: { stepFourSingle, stepThreeSingle },
  } = useNewEvent();

  const form = useForm<z.infer<typeof stepFourSingleSchema>>({
    resolver: zodResolver(stepFourSingleSchema),
    defaultValues: {
      sessions: stepFourSingle?.sessions ?? [],
    },
  });

  function onSubmit(values: z.infer<typeof stepFourSingleSchema>) {
    setData({ step: '4-single', data: values });
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

  const driversQuery = api.user.byId.useQuery({
    memberIds: stepThreeSingle?.driverIds,
  });

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
    setSessionFormOpen(false);
  }

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
                  <div className='flex flex-col gap-2 p-px'>
                    {field.value
                      .sort((a, b) => {
                        const startA = timeStringToDate(a.start);
                        const startB = timeStringToDate(b.start);

                        if (startA.isBefore(startB)) return -1;
                        if (startA.isAfter(startB)) return 1;
                        return 0;
                      })
                      .map(session => (
                        <div
                          key={session.id}
                          className='flex w-full items-center justify-between rounded-md bg-slate-950 px-3.5 py-3 ring-1 ring-slate-800'
                        >
                          <div className='flex flex-col gap-1.5'>
                            <span className='font-medium leading-none'>
                              {capitalize(session.type)}
                            </span>
                            <span className='text-sm leading-none text-slate-400'>
                              {session.start}{' '}
                              {'end' in session ? ` - ${session.end}` : ''}
                            </span>
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
                                >
                                  <Trash2Icon className='h-[18px] w-[18px] text-red-500' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove {session.type}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
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
                  {['practice', 'qualifying', 'race'].includes(
                    sessionForm.watch('type')
                  ) ? (
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
                  {sessionForm.watch('type') === 'qualifying' ? (
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
                                    <div className='flex h-[11px] w-[17px] items-center justify-center'>
                                      <Image
                                        src={`/flags/${
                                          driver.profile?.country ?? ''
                                        }.svg`}
                                        alt={''}
                                        width={17}
                                        height={11}
                                        className='object-cover'
                                      />
                                    </div>
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
                  {sessionForm.watch('type') === 'race' ? (
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
                    <Button type='submit'>Create</Button>
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
          >
            Back
          </Button>
          <Button type='submit' form='main-form'>
            Next
          </Button>
        </SheetFooter>
      </div>
    </>
  );
}

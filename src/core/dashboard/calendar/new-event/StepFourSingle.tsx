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
import { CheckCircleIcon, PlusIcon } from 'lucide-react';
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
import dayjs from 'dayjs';
import { api } from '~/utils/api';
import Image from 'next/image';
import { cn } from '~/lib/utils';
import { useEffect, useState } from 'react';

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

    const [startHours, startMinutes] = schema.start.split(':').map(Number) as [
      number,
      number
    ];

    const [endHours, endMinutes] = schema.end.split(':').map(Number) as [
      number,
      number
    ];

    const start = dayjs(
      new Date(
        dayjs().year(),
        dayjs().month(),
        dayjs().date(),
        startHours,
        startMinutes
      )
    );

    const end = dayjs(
      new Date(
        dayjs().year(),
        dayjs().month(),
        dayjs().date(),
        endHours,
        endMinutes
      )
    );

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
  sessions: z.array(sessionSchema),
});

export default function StepFourSingle() {
  const {
    setStep,
    steps: { stepFourSingle, stepThreeSingle },
  } = useNewEvent();

  const form = useForm<z.infer<typeof stepFourSingleSchema>>({
    resolver: zodResolver(stepFourSingleSchema),
    defaultValues: {
      sessions: stepFourSingle?.sessions ?? [],
    },
  });

  function onSubmit(values: z.infer<typeof stepFourSingleSchema>) {
    console.log(values);
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
    console.log(values);
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
          <form onSubmit={form.handleSubmit(onSubmit)}></form>
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
                                {type.charAt(0).toUpperCase()}
                                {type.slice(1)}
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
                                <button
                                  key={driver.id}
                                  type='button'
                                  className={cn(
                                    'flex w-full items-center gap-2 rounded-md bg-slate-950 px-3.5 py-2 ring-1 ring-slate-800 transition hover:bg-slate-900 hover:ring-slate-700',
                                    {
                                      'bg-slate-900': isActive,
                                    }
                                  )}
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
                                >
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
                                  <div>
                                    <span>
                                      {driver.firstName
                                        ?.slice(0, 1)
                                        .toUpperCase()}
                                      .
                                    </span>
                                    <span> {driver.lastName}</span>
                                  </div>
                                  <CheckCircleIcon
                                    className={cn(
                                      'ml-auto h-4 w-4 text-sky-500 opacity-0 transition-opacity',
                                      {
                                        'opacity-100': isActive,
                                      }
                                    )}
                                  />
                                </button>
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
          <Button type='submit'>Next</Button>
        </SheetFooter>
      </div>
    </>
  );
}

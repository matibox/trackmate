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
import { Loader2Icon, Trash2Icon, UsersIcon } from 'lucide-react';
import { Form, FormField, FormItem, FormMessage } from '~/components/ui/Form';
import { api } from '~/utils/api';
import { capitalize, timeStringToDate } from '~/lib/utils';
import crypto from 'crypto';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useToast } from '~/components/ui/useToast';
import { ScrollArea } from '~/components/ui/ScrollArea';
import { Separator } from '~/components/ui/Separator';
import SessionForm, { sessionSchema } from './SessionForm';
import { useCalendar } from '../../store';

export const step4SingleSchema = z.object({
  sessions: z
    .array(sessionSchema.and(z.object({ id: z.string() })))
    .min(1, 'Add at least 1 session.'),
});

export default function Step4Single() {
  const {
    setStep,
    setData,
    steps: { stepOne, stepTwoSingle, stepFourSingle, stepThreeSingle },
    setSheetOpened,
    reset,
  } = useNewEvent();
  const selectDay = useCalendar(s => s.selectDay);

  const { toast } = useToast();
  const router = useRouter();

  const driversQuery = api.user.byId.useQuery({
    memberIds: stepThreeSingle?.driverIds,
  });

  const utils = api.useContext();
  const createEvent = api.event.create.useMutation({
    onError: err =>
      toast({
        variant: 'destructive',
        title: 'An error occured',
        description: err.message,
      }),
    onSuccess: async date => {
      await router.push('/calendar?message=createdEvent');
      await utils.event.invalidate();
      setSheetOpened(false);
      selectDay({ day: dayjs(date) });
      reset();
    },
  });

  const form = useForm<z.infer<typeof step4SingleSchema>>({
    resolver: zodResolver(step4SingleSchema),
    defaultValues: {
      sessions: stepFourSingle?.sessions ?? [],
    },
  });

  async function onSubmit(values: z.infer<typeof step4SingleSchema>) {
    setData({ step: '4-single', data: values });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = stepOne!.eventType!;
    await createEvent.mutateAsync(
      eventType === 'single'
        ? {
            eventType,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stepTwo: stepTwoSingle!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stepThree: stepThreeSingle!,
            stepFour: values,
          }
        : { eventType }
    );
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
        <ScrollArea className='max-h-[60vh]'>
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
                            dayjs(a.date)
                          );

                          const startB = timeStringToDate(
                            b.start,
                            dayjs(b.date)
                          );

                          if (startA.isBefore(startB)) return -1;
                          if (startA.isAfter(startB)) return 1;
                          return 0;
                        })
                        .map(session => {
                          const day = dayjs(session.date);
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
                              className='flex w-full flex-col items-center justify-between rounded-md bg-slate-950 px-3.5 py-3 ring-1 ring-slate-800'
                            >
                              <div className='flex w-full flex-col gap-3'>
                                <div className='flex items-center justify-between'>
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
                                      {'end' in session
                                        ? ` - ${session.end}`
                                        : ''}
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
                                            const prev =
                                              form.getValues('sessions');
                                            form.setValue(
                                              'sessions',
                                              prev.filter(
                                                s => s.id !== session.id
                                              )
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
                                {session.type !== 'briefing' &&
                                session.serverInformation &&
                                Object.values(session.serverInformation).filter(
                                  Boolean
                                ).length > 0 ? (
                                  <>
                                    <Separator />
                                    <div className='flex flex-col gap-1.5'>
                                      {session.serverInformation.inGameTime ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          In-game:{' '}
                                          {session.serverInformation.inGameTime}
                                        </span>
                                      ) : null}
                                      {session.serverInformation.serverName ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          Server:{' '}
                                          {session.serverInformation.serverName}
                                        </span>
                                      ) : null}
                                      {session.serverInformation
                                        .serverPassword ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          Password:{' '}
                                          {
                                            session.serverInformation
                                              .serverPassword
                                          }
                                        </span>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {(session.type === 'qualifying' ||
                                  session.type === 'race') &&
                                session.weather &&
                                Object.values(session.weather).filter(Boolean)
                                  .length > 0 ? (
                                  <>
                                    <Separator />
                                    <div className='flex flex-col gap-1.5'>
                                      {session.weather.rainLevel ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          Rain level:{' '}
                                          {session.weather.rainLevel}
                                        </span>
                                      ) : null}
                                      {session.weather.cloudLevel ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          Cloud level:{' '}
                                          {session.weather.cloudLevel}
                                        </span>
                                      ) : null}
                                      {session.weather.randomness ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          Randomness:{' '}
                                          {session.weather.randomness}
                                        </span>
                                      ) : null}
                                      {session.weather.ambientTemp ? (
                                        <span className='text-sm leading-none text-slate-400'>
                                          Temperature:{' '}
                                          {session.weather.ambientTemp}°C
                                        </span>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
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
        </ScrollArea>
        <SessionForm
          addSession={session => {
            const prev = form.getValues('sessions');
            form.setValue('sessions', [
              ...prev,
              { id: crypto.randomBytes(4).toString('hex'), ...session },
            ]);
          }}
          loading={createEvent.isLoading}
        />
        <SheetFooter className='flex-row justify-between sm:justify-between'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => {
              const sessions = form.getValues('sessions');
              setData({ step: '4-single', data: { sessions } });
              setStep('3-single');
            }}
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

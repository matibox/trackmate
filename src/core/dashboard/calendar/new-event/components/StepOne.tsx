import {
  CheckCircle2Icon,
  FlagIcon,
  type LucideIcon,
  TrophyIcon,
  Loader2Icon,
} from 'lucide-react';
import { type ButtonHTMLAttributes } from 'react';
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { eventTypes } from '~/lib/constants';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/Button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormMessage } from '~/components/ui/Form';
import { useNewEvent } from '../store/newEventStore';
import { api } from '~/utils/api';

export const stepOneSchema = z.object({
  eventType: z.enum(eventTypes).nullable(),
});

export default function EventType() {
  const {
    setData,
    setStep,
    steps: { stepOne },
    setSheetOpened,
  } = useNewEvent();

  const { data, isLoading } = api.user.isInTeamOrRoster.useQuery();

  const form = useForm<z.infer<typeof stepOneSchema>>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      eventType: stepOne?.eventType ?? null,
    },
  });

  function onSubmit(values: z.infer<typeof stepOneSchema>) {
    const { eventType } = values;

    if (!eventType) return;

    setData({ step: '1', data: { eventType } });
    setStep(`2-${eventType as 'single'}`);
  }

  return (
    <>
      <>
        {data?.isInRoster && data?.isInTeam ? (
          <SheetHeader>
            <SheetTitle className='text-3xl'>Create event</SheetTitle>
            <SheetDescription>
              Select event type first, click next when you&apos;re ready.
            </SheetDescription>
          </SheetHeader>
        ) : null}
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2Icon className='h-4 w-4 animate-spin text-slate-50' />
          </div>
        ) : null}
        {data?.isInRoster && data?.isInTeam ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='grid gap-4 py-8'>
                <FormField
                  control={form.control}
                  name='eventType'
                  render={({ field }) => (
                    <>
                      <EventTypeButton
                        icon={FlagIcon}
                        title='Single event'
                        label='Create a one-off event.'
                        isActive={field.value === 'single'}
                        onClick={() =>
                          form.setValue(
                            'eventType',
                            field.value === 'single' ? null : 'single'
                          )
                        }
                      />
                      <EventTypeButton
                        icon={TrophyIcon}
                        title='Championship event'
                        label='Create an event associated with a championship.'
                        isActive={field.value === 'championship'}
                        onClick={() =>
                          form.setValue(
                            'eventType',
                            field.value === 'championship'
                              ? null
                              : 'championship'
                          )
                        }
                        disabled
                      />
                      <FormMessage />
                    </>
                  )}
                />
                <SheetFooter>
                  <Button
                    type='submit'
                    className='self-end'
                    disabled={form.watch('eventType') === null}
                  >
                    Next
                  </Button>
                </SheetFooter>
              </div>
            </form>
          </Form>
        ) : (
          <div className='flex h-full -translate-y-8 items-center justify-center text-slate-50'>
            <div className='flex flex-col items-center justify-center gap-4 text-center'>
              {!data?.isInRoster ? (
                <>
                  <div className='space-y-2'>
                    <h2 className='text-lg font-medium leading-none'>
                      You are not part of any{' '}
                      {!data?.isInTeam ? 'team' : 'roster'}
                    </h2>
                    <p className='text-slate-400'>
                      Please create or join a{' '}
                      {!data?.isInTeam ? 'team' : 'roster'} to create events.
                    </p>
                  </div>
                  <Button
                    variant='primary'
                    onClick={() => setSheetOpened(false)}
                  >
                    Go to teams tab
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </>
    </>
  );
}

interface EventTypeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  title: string;
  label: string;
  isActive: boolean;
}

function EventTypeButton({
  icon,
  title,
  label,
  isActive,
  ...props
}: EventTypeButtonProps) {
  const Icon = icon;

  return (
    <button
      className={cn(
        'relative flex w-full select-none flex-col justify-end rounded-md bg-gradient-to-tr from-sky-700/25 via-slate-900/50 via-35% to-slate-900 bg-[length:200%_200%] bg-right-top p-6 no-underline outline-none ring-offset-slate-950 transition-[background-position] duration-500 hover:bg-left-bottom focus:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-left-bottom': isActive,
        }
      )}
      type='button'
      {...props}
    >
      <CheckCircle2Icon
        className={cn(
          'absolute right-6 top-6 text-sky-500 opacity-0 transition-opacity',
          {
            'opacity-100': isActive,
          }
        )}
      />
      <Icon className='h-6 w-6 text-slate-50' />
      <div className='mb-2 mt-4 text-lg font-medium text-slate-50'>{title}</div>
      <p className='text-left text-sm leading-tight text-slate-400'>{label}</p>
    </button>
  );
}

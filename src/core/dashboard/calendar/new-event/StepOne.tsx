import {
  CheckCircle2Icon,
  FlagIcon,
  type LucideIcon,
  TrophyIcon,
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
import { Form, FormField } from '~/components/ui/Form';
import { useNewEvent } from './newEventStore';

export const eventTypeSchema = z.object({
  eventType: z.enum(eventTypes).nullable(),
});

export default function EventType() {
  const { setData } = useNewEvent();

  const form = useForm<z.infer<typeof eventTypeSchema>>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      eventType: null,
    },
  });

  function onSubmit(values: z.infer<typeof eventTypeSchema>) {
    const { eventType } = values;

    if (!eventType) return;

    setData({ step: '1', data: { eventType } });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create event</SheetTitle>
        <SheetDescription>
          Select event type first, click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
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
                        field.value === 'championship' ? null : 'championship'
                      )
                    }
                    disabled
                  />
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

import { api } from '~/utils/api';
import { useCalendar } from './store';
import dayjs from 'dayjs';
import { cn, groupBy } from '~/lib/utils';
import { addOrdinal } from '~/lib/dates';
import { Loader2 } from 'lucide-react';
import { useToast } from '~/components/ui/useToast';
import { useEffect } from 'react';
import Event from './Event';

export default function EventList() {
  const currentDay = useCalendar(s => s.currentDay);

  const {
    data: sessions,
    status,
    error,
  } = api.event.fromTo.useQuery({
    from: currentDay.startOf('week').toDate(),
    to: currentDay.endOf('week').toDate(),
  });

  const { toast } = useToast();

  useEffect(() => {
    if (status !== 'error') return;
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: error.message,
    });
  }, [error?.message, status, toast]);

  if (status === 'success') {
    const sessionsByDay = groupBy(
      sessions,
      s => s.start.toISOString().split('T')[0] as string
    );

    return (
      <section className='flex flex-col gap-8 md:sticky md:col-start-2 md:row-span-3 md:row-start-1'>
        {sessions.length > 0 ? (
          Object.entries(sessionsByDay).map(([day, data]) => {
            const isSelected = dayjs(day).isSame(currentDay);
            const formattedDay = `${dayjs(day).format('dddd')}, ${addOrdinal(
              dayjs(day).date()
            )}`;

            const uniqueSessionsByEventIdAndDate = [
              ...new Map(
                data.map(s => [`${s.event.id}${day}`, { ...s }])
              ).values(),
            ];

            return (
              <div key={day} className='flex flex-col gap-3'>
                <div
                  className={cn('flex items-center text-xl transition-colors', {
                    'text-sky-500': isSelected,
                  })}
                >
                  {dayjs(day).date() === dayjs().date() ? (
                    <div
                      className={cn(
                        'mr-2 flex items-center rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold uppercase leading-none tracking-wide text-slate-200 transition',
                        {
                          'bg-sky-700 text-slate-50': isSelected,
                        }
                      )}
                    >
                      today
                    </div>
                  ) : null}
                  <span className='leading-none'>{formattedDay}</span>
                </div>
                <div className='flex flex-col gap-4'>
                  {uniqueSessionsByEventIdAndDate.map(session => (
                    <Event key={session.id} session={session} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className='text-center text-slate-300'>
            There are no scheduled events for this week.
          </div>
        )}
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className='flex flex-col items-center md:col-start-2 md:row-span-2 md:row-start-1'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className='flex flex-col items-center md:col-start-2 md:row-span-2 md:row-start-1'>
        <p className='text-slate-300'>
          An error occured, try refreshing the page.
        </p>
      </section>
    );
  }

  return null;
}

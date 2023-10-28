import { api } from '~/utils/api';
import { useCalendar } from './store';
import dayjs from 'dayjs';
import { cn, groupBy } from '~/lib/utils';
import { addOrdinal } from '~/lib/dates';
import { Loader2 } from 'lucide-react';

export default function EventList() {
  const currentDay = useCalendar(s => s.currentDay);

  const { data: sessions, status } = api.event.fromTo.useQuery({
    from: currentDay.set('day', 1).toDate(),
    to: currentDay.set('day', 7).toDate(),
  });

  if (status === 'success') {
    const sessionsByDay = groupBy(
      sessions,
      s => s.start.toISOString().split('T')[0] as string
    );

    return (
      <section className='flex flex-col gap-8'>
        {sessions.length > 0 ? (
          Object.entries(sessionsByDay).map(([day, data]) => {
            const isSelected = dayjs(day).isSame(currentDay);
            const formattedDay = `${dayjs(day).format('dddd')}, ${addOrdinal(
              dayjs(day).date()
            )}`;

            return (
              <div key={day} className='flex flex-col gap-3'>
                <span
                  className={cn('text-xl transition-colors', {
                    'text-sky-500': isSelected,
                  })}
                >
                  {formattedDay}
                </span>
                <div className='flex flex-col gap-4'>
                  {data.map(session => (
                    <div key={session.id}>
                      {dayjs(session.start).format('DD/MM/YYYY HH:mm')}
                    </div>
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
      <section className='flex flex-col items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </section>
    );
  }

  return null;
}

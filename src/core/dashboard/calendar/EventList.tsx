import { api } from '~/utils/api';
import { useCalendar } from './store';
import dayjs from 'dayjs';
import { groupBy } from '~/lib/utils';
import { Fragment } from 'react';

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
      <section>
        {Object.entries(sessionsByDay).map(([key, data]) => (
          <Fragment key={key}>
            {dayjs(key).format('dddd')}
            {data.map(session => (
              <div key={session.id}>
                {dayjs(session.start).format('DD/MM/YYYY HH:mm')}
              </div>
            ))}
          </Fragment>
        ))}
      </section>
    );
  }

  return null;
}

import { api } from '~/utils/api';
import { useCalendar } from './store';
import dayjs from 'dayjs';

export default function EventList() {
  const currentDay = useCalendar(s => s.currentDay);

  const { data: sessions } = api.event.fromTo.useQuery({
    from: currentDay.set('day', 1).toDate(),
    to: currentDay.set('day', 7).toDate(),
  });

  return (
    <section>
      {sessions?.map(session => (
        <div key={session.id}>
          {dayjs(session.start).format('DD/MM/YYYY HH:mm')}
        </div>
      ))}
    </section>
  );
}

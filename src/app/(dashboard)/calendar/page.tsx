import CalendarNav from './_components/CalendarNav';
import Calendar from './_components/Calendar';
import { api } from '~/trpc/server';
import dayjs from '~/lib/dates';

export default async function CalendarPage() {
  await api.event.ofDriverFromTo.prefetch({
    from: dayjs().set('date', 1).toDate(),
    to: dayjs().set('date', dayjs().daysInMonth()).toDate(),
  });

  return (
    <>
      <CalendarNav />
      <Calendar />
    </>
  );
}

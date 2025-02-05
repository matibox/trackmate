import CalendarNav from './_components/CalendarNav';
import Calendar from './_components/Calendar';

export default async function CalendarPage() {
  // TODO await prefetch event query

  return (
    <>
      <CalendarNav />
      <Calendar />
    </>
  );
}

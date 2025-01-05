import { redirect } from 'next/navigation';
import Calendar from '../_components/Calendar';
import CalendarNav from '../_components/CalendarNav';
import NewEvent from './_components/NewEvent';

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { d: string };
}) {
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { d } = searchParams;
  if (!d || d.length !== 8) redirect('/calendar/');

  return (
    <>
      <CalendarNav />
      <Calendar />
      <NewEvent selectedDateStr={d} />
    </>
  );
}

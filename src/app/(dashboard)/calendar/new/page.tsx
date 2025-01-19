import { redirect } from 'next/navigation';
import Calendar from '../_components/Calendar';
import CalendarNav from '../_components/CalendarNav';
import NewEvent from './_components/NewEvent';
import { auth } from '~/server/auth';

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ d: string }>;
}) {
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  const { d } = await searchParams;
  if (!d || d.length !== 8) redirect('/calendar/');

  const session = await auth();

  return (
    <>
      <CalendarNav />
      <Calendar />
      <NewEvent selectedDateStr={d} user={session!.user} />
    </>
  );
}

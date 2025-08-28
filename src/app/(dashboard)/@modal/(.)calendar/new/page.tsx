import { redirect } from 'next/navigation';
import NewEvent from '~/app/(dashboard)/calendar/new/_components/NewEvent';
import { auth } from '~/server/auth';

export default async function NewEventModalPage({
  searchParams,
}: {
  searchParams: Promise<{ d: string | undefined }>;
}) {
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  const { d } = await searchParams;
  if (d && d.length !== 8) redirect('/calendar/');

  const session = await auth();

  return <NewEvent selectedDateStr={d} user={session!.user} />;
}

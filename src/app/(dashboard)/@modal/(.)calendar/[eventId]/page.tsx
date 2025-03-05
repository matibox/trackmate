import EventDetails from '~/app/(dashboard)/calendar/[eventId]/_components/EventDetails';

export default async function EventDetailsModalPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <EventDetails eventId={parseInt(eventId)} />;
}

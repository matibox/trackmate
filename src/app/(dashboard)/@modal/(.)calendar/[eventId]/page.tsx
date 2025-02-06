import EventDetails from '~/app/(dashboard)/calendar/[eventId]/_components/EventDetails';

export default function EventDetailsModalPage({
  params: { eventId: _eventId },
}: {
  params: { eventId: string };
}) {
  const eventId = parseInt(_eventId);

  return <EventDetails eventId={eventId} />;
}

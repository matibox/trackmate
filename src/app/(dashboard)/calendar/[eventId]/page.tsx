import { api } from '~/trpc/server';
import EventDetails from './_components/EventDetails';

export default async function EventDetailsPage({
  params: { eventId: _eventId },
}: {
  params: { eventId: string };
}) {
  const eventId = parseInt(_eventId);

  await api.event.byId.prefetch({ eventId });

  return <EventDetails eventId={eventId} />;
}

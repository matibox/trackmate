import { api } from '~/trpc/server';
import EventDetails from './_components/EventDetails';

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId: _eventId } = await params;
  const eventId = parseInt(_eventId);

  await api.event.byId.prefetch({ eventId });

  return <EventDetails eventId={eventId} />;
}

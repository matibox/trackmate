import { useRouter } from 'next/router';
import { api } from '~/utils/api';

export function useEventQuery() {
  const router = useRouter();
  const { eventId } = router.query as { eventId: string };

  const { data: event } = api.event.single.useQuery(
    { eventId },
    { enabled: !!eventId }
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return event!;
}

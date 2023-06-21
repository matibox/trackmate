import { useRouter } from 'next/router';
import { api } from '~/utils/api';

export function useCalendarQuery() {
  const router = useRouter();
  const { userId } = router.query as { userId: string };

  const { data: user } = api.user.calendar.useQuery(
    { userId },
    { enabled: !!userId }
  );

  return user?.events;
}

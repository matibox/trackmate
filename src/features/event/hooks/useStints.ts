/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { api } from '~/utils/api';

export function useStints() {
  const router = useRouter();
  const { eventId } = router.query as { eventId: string };

  const { data: event } = api.event.single.useQuery(
    { eventId },
    { enabled: !!eventId }
  );

  const totalDuration = useMemo(
    () =>
      dayjs(
        new Date(
          dayjs().year(),
          dayjs().month(),
          dayjs().date(),
          event!.duration / 60
        )
      ).format('HH:mm:ss'),
    [event]
  );

  const lastStintEndsAt = useMemo(() => {
    const lastStint = event!.stints[event!.stints.length - 1];
    if (!lastStint) return event!.date;
    if (!lastStint.duration) return lastStint.estimatedEnd;
    return dayjs(lastStint.start).add(lastStint.duration, 'minute').toDate();
  }, [event]);

  return { totalDuration, lastStintEndsAt, availableDrivers: event!.drivers };
}

import { type EventSession } from '@prisma/client';
import dayjs from 'dayjs';
import { useMemo } from 'react';

export function useSessionStatus({
  session: { start, end },
}: {
  session: Pick<EventSession, 'start' | 'end'>;
}) {
  const status = useMemo(() => {
    if (dayjs().isBetween(dayjs(start), dayjs(end))) return 'running';
    if (dayjs(start).isBefore(dayjs())) return 'finished';
    return 'upcoming';
  }, [end, start]);

  return status;
}

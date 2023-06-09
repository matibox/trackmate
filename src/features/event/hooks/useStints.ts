import dayjs from 'dayjs';
import { useMemo } from 'react';
import { type Event } from '~/pages/event/[eventId]';

export function useStints(event: Event) {
  const duration = useMemo(
    () =>
      dayjs(
        new Date(
          dayjs().year(),
          dayjs().month(),
          dayjs().date(),
          event.duration / 60
        )
      ).format('HH:mm:ss'),
    [event.duration]
  );

  return { duration };
}

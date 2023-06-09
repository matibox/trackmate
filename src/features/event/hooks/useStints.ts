import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useEventQuery } from './useEventQuery';

export function useStints() {
  const event = useEventQuery();

  const totalDuration = useMemo(
    () =>
      dayjs(
        new Date(
          dayjs().year(),
          dayjs().month(),
          dayjs().date(),
          event.duration / 60
        )
      ).format('HH:mm:ss'),
    [event]
  );

  const lastStintEndsAt = useMemo(() => {
    const lastStint = event.stints[event.stints.length - 1];
    if (!lastStint) return event.date;
    if (!lastStint.duration) return lastStint.estimatedEnd;
    return dayjs(lastStint.start).add(lastStint.duration, 'minute').toDate();
  }, [event]);

  return { totalDuration, lastStintEndsAt, availableDrivers: event.drivers };
}

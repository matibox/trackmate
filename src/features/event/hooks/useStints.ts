import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useEventQuery } from './useEventQuery';
import {
  durationStrToNum,
  formatDuration,
  getStintDuration,
} from '~/utils/stints';

export function useStints() {
  const event = useEventQuery();

  const totalDuration = useMemo(
    () => formatDuration(event.duration),
    [event.duration]
  );

  const totalStintsDuration = useMemo(() => {
    const duration = event.stints
      .map(getStintDuration)
      .reduce((a, b) => a + b, 0);
    return formatDuration(duration);
  }, [event.stints]);

  const lastStintEndsAt = useMemo(() => {
    const lastStint = event.stints[event.stints.length - 1];
    if (!lastStint) return event.date;
    if (!lastStint.duration) return lastStint.estimatedEnd;
    return dayjs(lastStint.start).add(lastStint.duration, 'minute').toDate();
  }, [event]);

  const stintLengthStatus = useMemo(() => {
    const eventDuration = durationStrToNum(totalDuration);
    const stintsDuration = durationStrToNum(totalStintsDuration);

    if (stintsDuration.isBefore(eventDuration)) return 'less';
    if (stintsDuration.isAfter(eventDuration)) return 'more';
    return 'even';
  }, [totalDuration, totalStintsDuration]);

  const allDriversUsed = useMemo(() => {
    const usedDrivers = new Set([...event.stints.map(s => s.driver)]);
    return event.drivers.length === usedDrivers.size;
  }, [event.drivers.length, event.stints]);

  return {
    totalDuration,
    totalStintsDuration,
    lastStintEndsAt,
    stintLengthStatus,
    allDriversUsed,
    availableDrivers: event.drivers,
  } as const;
}

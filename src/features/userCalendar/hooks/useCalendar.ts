import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { getCalendarPage, getCalendarPageBoundaries } from '~/lib/dates';
import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { hasRole } from '~/utils/helpers';
import { useError } from '~/hooks/useError';

export function useCalendar() {
  const { data: session } = useSession();

  const [monthIndex, setMonthIndex] = useState(dayjs().month());

  const calendarPage = useMemo(() => getCalendarPage(monthIndex), [monthIndex]);

  const [firstDay, lastDay] = useMemo(
    () => getCalendarPageBoundaries(calendarPage),
    [calendarPage]
  );

  const today = useMemo(() => dayjs(), []);
  const [selectedDay, selectDay] = useState(today);

  const utils = api.useContext();
  const { Error, setError } = useError();

  const incrementMonth = useCallback(async () => {
    setMonthIndex(prev => prev + 1);
    await utils.event.getDrivingEvents.invalidate();
    await utils.event.getManagingEvents.invalidate();
  }, [utils.event.getDrivingEvents, utils.event.getManagingEvents]);

  const decrementMonth = useCallback(async () => {
    setMonthIndex(prev => prev - 1);
    await utils.event.getDrivingEvents.invalidate();
    await utils.event.getManagingEvents.invalidate();
  }, [utils.event.getDrivingEvents, utils.event.getManagingEvents]);

  const { data: drivingEvents, isInitialLoading: driverEventsLoading } =
    api.event.getDrivingEvents.useQuery(
      {
        firstDay,
        lastDay,
      },
      {
        enabled: !!hasRole(session, 'driver'),
        onError: err => setError(err.message),
      }
    );

  const { data: managingEvents, isInitialLoading: managingEventsLoading } =
    api.event.getDrivingEvents.useQuery(
      {
        firstDay,
        lastDay,
      },
      {
        enabled: !!hasRole(session, 'manager'),
        onError: err => setError(err.message),
      }
    );

  return {
    isLoading: driverEventsLoading || managingEventsLoading,
    drivingEvents,
    managingEvents,
    selectedDay,
    selectDay,
    incrementMonth,
    decrementMonth,
    today,
    calendarPage,
    Error,
    monthIndex,
  };
}

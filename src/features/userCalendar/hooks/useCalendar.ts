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

  const incrementMonth = useCallback(() => setMonthIndex(prev => prev + 1), []);
  const decrementMonth = useCallback(() => setMonthIndex(prev => prev - 1), []);

  const handleChangeMonth = async (
    changeMonthFn: () => void,
    sameMonthDayToSelect: dayjs.Dayjs
  ) => {
    await utils.event.invalidate();
    if (monthIndex === selectedDay.month()) selectDay(sameMonthDayToSelect);
    changeMonthFn();
  };

  const handlePrevMonth = async () => {
    await handleChangeMonth(
      decrementMonth,
      dayjs(
        new Date(
          dayjs().year(),
          monthIndex - 1,
          dayjs(new Date(dayjs().year(), monthIndex - 1)).daysInMonth()
        )
      )
    );
  };

  const handleNextMonth = async () => {
    await handleChangeMonth(
      incrementMonth,
      dayjs(new Date(dayjs().year(), monthIndex + 1, 1))
    );
  };

  const { data: drivingEvents, isInitialLoading: driverEventsLoading } =
    api.event.getDrivingEvents.useQuery(
      {
        firstDay,
        lastDay,
      },
      {
        enabled: !!hasRole(session, 'driver') && false,
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
        enabled: !!hasRole(session, 'manager') && false,
        onError: err => setError(err.message),
      }
    );

  return {
    isLoading: driverEventsLoading || managingEventsLoading,
    drivingEvents,
    managingEvents,
    selectedDay,
    selectDay,
    incrementMonth: handleNextMonth,
    decrementMonth: handlePrevMonth,
    today,
    calendarPage,
    Error,
    monthIndex,
  };
}

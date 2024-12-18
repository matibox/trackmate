'use client';

import { type Dayjs } from 'dayjs';
import { createContext, type ReactNode, useContext, useState } from 'react';
import dayjs from '~/lib/dates';

type CalendarContext = {
  date: Dayjs;
  nextMonth: () => void;
  prevMonth: () => void;
  setToday: () => void;
};

const CalendarContext = createContext<CalendarContext | null>(null);

export function useCalendarContext() {
  const ctx = useContext(CalendarContext);

  if (!ctx) {
    throw new Error(
      'useCalendarContext has to be used within <CalendarContext.Provider>'
    );
  }

  return ctx;
}

export default function CalendarContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [now, setNow] = useState(dayjs());

  return (
    <CalendarContext.Provider
      value={{
        date: now,
        nextMonth: () => setNow(now.add(1, 'month')),
        prevMonth: () => setNow(now.subtract(1, 'month')),
        setToday: () => setNow(dayjs()),
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

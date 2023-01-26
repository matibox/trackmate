import dayjs, { type Dayjs } from 'dayjs';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getCalendarPage } from '../lib/dates';

type CalendarStore = {
  page: Dayjs[][];
  setPage: (month: number) => void;
  monthIndex: number;
  incrementMonth: () => void;
  decrementMonth: () => void;
  today: Dayjs;
  selectedDay: Dayjs;
  selectDay: (day: Dayjs) => void;
};

export const useCalendarStore = create<CalendarStore>()(
  subscribeWithSelector(set => ({
    page: getCalendarPage(),
    setPage: month => set(() => ({ page: getCalendarPage(month) })),
    monthIndex: dayjs().month(),
    incrementMonth: () => set(state => ({ monthIndex: state.monthIndex + 1 })),
    decrementMonth: () => set(state => ({ monthIndex: state.monthIndex - 1 })),
    today: dayjs(),
    selectedDay: dayjs(),
    selectDay: day => set(() => ({ selectedDay: day })),
  }))
);

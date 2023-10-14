import dayjs, { type Dayjs } from 'dayjs';
import { subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';

type CalendarStore = {
  currentDay: Dayjs;
  getCurrentMonthIndex: () => number;
  nextMonth: () => void;
  prevMonth: () => void;
};

export const useCalendar = create<CalendarStore>()(
  subscribeWithSelector((set, get) => ({
    currentDay: dayjs(
      new Date(dayjs().year(), dayjs().month(), dayjs().date())
    ),
    getCurrentMonthIndex: () => get().currentDay.month(),
    nextMonth: () =>
      set(state => ({ currentDay: state.currentDay.add(1, 'month') })),
    prevMonth: () =>
      set(state => ({ currentDay: state.currentDay.subtract(1, 'month') })),
  }))
);

import dayjs, { type Dayjs } from 'dayjs';
import { subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';

type CalendarStore = {
  currentDay: Dayjs;
  nextMonth: () => void;
  prevMonth: () => void;
  selectDay: ({ day }: { day: Dayjs }) => void;
};

export const useCalendar = create<CalendarStore>()(
  subscribeWithSelector(set => ({
    currentDay: dayjs(
      new Date(dayjs().year(), dayjs().month(), dayjs().date())
    ),
    nextMonth: () =>
      set(state => {
        const { currentDay } = state;
        return {
          currentDay: currentDay.add(
            currentDay.daysInMonth() - currentDay.date() + 1,
            'days'
          ),
        };
      }),
    prevMonth: () =>
      set(state => {
        const { currentDay } = state;
        return {
          currentDay: currentDay.subtract(currentDay.date(), 'days'),
        };
      }),
    selectDay: ({ day }) => set(() => ({ currentDay: day })),
  }))
);

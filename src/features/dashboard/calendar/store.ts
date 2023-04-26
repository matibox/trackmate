import dayjs, { type Dayjs } from 'dayjs';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getCalendarPage } from '~/lib/dates';
import { type RouterOutputs } from '~/utils/api';

type CalendarStore = {
  page: Dayjs[][];
  setPage: (month: number) => void;
  monthIndex: number;
  incrementMonth: () => void;
  decrementMonth: () => void;
  today: Dayjs;
  selectedDay: Dayjs;
  selectDay: (day: Dayjs) => void;
  drivingEvents: RouterOutputs['event']['getDrivingEvents'] | undefined;
  setDrivingEvents: (events: CalendarStore['drivingEvents']) => void;
  managingEvents: RouterOutputs['event']['getManagingEvents'] | undefined;
  setManagingEvents: (events: CalendarStore['managingEvents']) => void;
  teamEvents: RouterOutputs['event']['getTeamEvents'] | undefined;
  setTeamEvents: (events: CalendarStore['teamEvents']) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
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
    drivingEvents: undefined,
    setDrivingEvents: events => set(() => ({ drivingEvents: events })),
    managingEvents: undefined,
    setManagingEvents: events => set(() => ({ managingEvents: events })),
    teamEvents: undefined,
    setTeamEvents: events => set(() => ({ teamEvents: events })),
    loading: false,
    setLoading: loading => set(() => ({ loading })),
  }))
);

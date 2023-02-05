import dayjs, { type Dayjs } from 'dayjs';
import { create } from 'zustand';

type TeamResultsStore = {
  incrementMonth: () => void;
  decrementMonth: () => void;
  current: Dayjs;
};

export const useTeamResultsStore = create<TeamResultsStore>()(set => ({
  incrementMonth: () =>
    set(state => ({ current: state.current.add(1, 'month') })),
  decrementMonth: () =>
    set(state => ({ current: state.current.subtract(1, 'month') })),
  current: dayjs(),
}));

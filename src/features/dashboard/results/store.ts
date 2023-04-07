import dayjs, { type Dayjs } from 'dayjs';
import { create } from 'zustand';
import { type resultsSortingOptions } from '~/constants/constants';

type Order = 'asc' | 'desc';

type ResultsStore = {
  incrementMonth: () => void;
  decrementMonth: () => void;
  current: Dayjs;
  sorting: {
    toggle: () => void;
    isOpened: boolean;
    activeSort: {
      by: (typeof resultsSortingOptions)[number];
      order: Order;
    };
    setSort: (by: (typeof resultsSortingOptions)[number], order: Order) => void;
  };
  resultsType: 'regular' | 'championship';
  toggleType: () => void;
};

export const useResultsStore = create<ResultsStore>()(set => ({
  incrementMonth: () =>
    set(state => ({ current: state.current.add(1, 'month') })),
  decrementMonth: () =>
    set(state => ({ current: state.current.subtract(1, 'month') })),
  current: dayjs(),
  sorting: {
    toggle: () =>
      set(state => ({
        ...state,
        sorting: { ...state.sorting, isOpened: !state.sorting.isOpened },
      })),
    isOpened: false,
    activeSort: {
      by: 'eventDate',
      order: 'asc',
    },
    setSort: (by, order) =>
      set(state => ({
        ...state,
        sorting: { ...state.sorting, activeSort: { by, order } },
      })),
  },
  resultsType: 'regular',
  toggleType: () =>
    set(state => ({
      resultsType: state.resultsType === 'regular' ? 'championship' : 'regular',
    })),
}));

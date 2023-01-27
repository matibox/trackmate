import { create } from 'zustand';

type NewEventStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
};

export const useNewEventStore = create<NewEventStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () => set(() => ({ isOpened: false })),
}));

import { create } from 'zustand';

type Event = {
  id: string;
  title: string;
};

type ResultStore = {
  isOpened: boolean;
  open: (event: Event) => void;
  close: () => void;
  event: Event | undefined;
};

export const useResultStore = create<ResultStore>()(set => ({
  isOpened: false,
  open: event => set(() => ({ isOpened: true, event })),
  close: () => set(() => ({ isOpened: false, event: undefined })),
  event: undefined,
}));

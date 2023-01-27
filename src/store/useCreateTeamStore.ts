import { create } from 'zustand';

type NewTeamStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
};

export const useCreateTeamStore = create<NewTeamStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () => set(() => ({ isOpened: false })),
}));

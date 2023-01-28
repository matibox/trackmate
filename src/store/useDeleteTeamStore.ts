import { create } from 'zustand';

type DeleteTeamStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
};

export const useDeleteTeamStore = create<DeleteTeamStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () => set(() => ({ isOpened: false })),
}));

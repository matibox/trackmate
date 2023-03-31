import { create } from 'zustand';

type PostSetupStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
};

export const usePostSetupStore = create<PostSetupStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () => set(() => ({ isOpened: false })),
}));

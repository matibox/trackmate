import { create } from 'zustand';

type PostSetupStore = {
  isOpened: boolean;
  open: (event: { id: string; name: string }) => void;
  close: () => void;
  event: {
    id: string;
    name: string;
  } | null;
};

export const usePostSetupStore = create<PostSetupStore>()(set => ({
  isOpened: false,
  open: event => set(() => ({ isOpened: true, event })),
  close: () => set(() => ({ isOpened: false, event: null })),
  event: null,
}));

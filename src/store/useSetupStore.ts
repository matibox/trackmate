import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type SetupStore = {
  post: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
};

export const useSetupStore = create<SetupStore>()(
  immer(set => ({
    post: {
      isOpened: false,
      open: () =>
        set(state => {
          state.post.isOpened = true;
        }),
      close: () =>
        set(state => {
          state.post.isOpened = false;
        }),
    },
  }))
);

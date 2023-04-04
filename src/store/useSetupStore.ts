import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type RouterOutputs } from '../utils/api';

type Setup = RouterOutputs['setup']['getAll'][number];

type SetupStore = {
  post: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
  edit: {
    setup: Setup | null;
    isOpened: boolean;
    open: (setup: Setup) => void;
    close: () => void;
  };
  delete: {
    setup: Pick<Setup, 'id' | 'name'> | null;
    isOpened: boolean;
    open: (setup: Pick<Setup, 'id' | 'name'>) => void;
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
    edit: {
      isOpened: false,
      open: setup =>
        set(state => {
          state.edit.isOpened = true;
          state.edit.setup = setup;
        }),
      close: () =>
        set(state => {
          state.edit.isOpened = false;
          state.edit.setup = null;
        }),
      setup: null,
    },
    delete: {
      isOpened: false,
      open: setup =>
        set(state => {
          state.delete.isOpened = true;
          state.delete.setup = setup;
        }),
      close: () =>
        set(state => {
          state.delete.isOpened = false;
          state.delete.setup = null;
        }),
      setup: null,
    },
  }))
);

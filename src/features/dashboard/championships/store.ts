import { create } from 'zustand';

type ChampionshipStore = {
  create: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
  delete: {
    isOpened: boolean;
    open: (championshipId: string, championshipName: string) => void;
    close: () => void;
    championshipId: string | undefined;
    championshipName: string | undefined;
  };
};

export const useChampionshipStore = create<ChampionshipStore>()(set => ({
  create: {
    isOpened: false,
    open: () =>
      set(state => ({
        create: {
          ...state.create,
          isOpened: true,
        },
      })),
    close: () =>
      set(state => ({
        create: {
          ...state.create,
          isOpened: false,
        },
      })),
  },
  delete: {
    isOpened: false,
    championshipId: undefined,
    championshipName: undefined,
    open: (championshipId, championshipName) =>
      set(state => ({
        delete: {
          ...state.delete,
          isOpened: true,
          championshipId,
          championshipName,
        },
      })),
    close: () =>
      set(state => ({
        delete: {
          ...state.delete,
          isOpened: false,
          championshipId: undefined,
          championshipName: undefined,
        },
      })),
  },
}));

import { create } from 'zustand';

type ChampionshipStore = {
  createChampionshipPopup: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
  deleteChampionshipPopup: {
    isOpened: boolean;
    open: (championshipId: string, championshipName: string) => void;
    close: () => void;
    championshipId: string | undefined;
    championshipName: string | undefined;
  };
};

export const useChampionshipStore = create<ChampionshipStore>()(set => ({
  createChampionshipPopup: {
    isOpened: false,
    open: () =>
      set(state => ({
        createChampionshipPopup: {
          ...state.createChampionshipPopup,
          isOpened: true,
        },
      })),
    close: () =>
      set(state => ({
        createChampionshipPopup: {
          ...state.createChampionshipPopup,
          isOpened: false,
        },
      })),
  },
  deleteChampionshipPopup: {
    isOpened: false,
    championshipId: undefined,
    championshipName: undefined,
    open: (championshipId, championshipName) =>
      set(state => ({
        deleteChampionshipPopup: {
          ...state.deleteChampionshipPopup,
          isOpened: true,
          championshipId,
          championshipName,
        },
      })),
    close: () =>
      set(state => ({
        deleteChampionshipPopup: {
          ...state.deleteChampionshipPopup,
          isOpened: false,
          championshipId: undefined,
          championshipName: undefined,
        },
      })),
  },
}));

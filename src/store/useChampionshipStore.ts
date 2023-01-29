import { create } from 'zustand';

type ChampionshipStore = {
  createChampionshipPopup: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
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
}));

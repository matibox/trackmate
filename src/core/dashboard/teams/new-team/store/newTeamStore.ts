import { create } from 'zustand';

export const useNewTeam = create<{
  sheetOpened: boolean;
  setSheetOpened: (opened: boolean) => void;
}>(set => ({
  sheetOpened: false,
  setSheetOpened: sheetOpened => set(() => ({ sheetOpened })),
}));

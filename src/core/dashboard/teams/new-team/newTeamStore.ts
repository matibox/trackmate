import { type z } from 'zod';
import { create } from 'zustand';
import { type newTeamSchema } from './NewTeam';

export const useNewTeam = create<{
  sheetOpened: boolean;
  setSheetOpened: (opened: boolean) => void;
  data: z.infer<typeof newTeamSchema> | undefined | null;
  setData: (data: z.infer<typeof newTeamSchema> | null) => void;
}>(set => ({
  sheetOpened: false,
  setSheetOpened: sheetOpened => set(() => ({ sheetOpened })),
  data: undefined,
  setData: data => set(() => ({ data })),
}));

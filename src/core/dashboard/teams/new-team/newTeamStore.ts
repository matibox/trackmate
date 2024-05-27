import { type z } from 'zod';
import { create } from 'zustand';
import { type newTeamSchema } from './NewTeam';

export const useNewTeam = create<{
  sheetOpened: boolean;
  setSheetOpened: (opened: boolean) => void;
  data: z.infer<typeof newTeamSchema> | undefined | null;
  setData: (data: z.infer<typeof newTeamSchema> | null) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  editModeTeamId: string | undefined;
  setEditModeTeamId: (id: string | undefined) => void;
  reset: () => void;
}>(set => ({
  sheetOpened: false,
  setSheetOpened: sheetOpened => set(() => ({ sheetOpened })),
  data: undefined,
  setData: data => set(() => ({ data })),
  editMode: false,
  setEditMode: editMode => set(() => ({ editMode })),
  editModeTeamId: undefined,
  setEditModeTeamId: editModeTeamId => set(() => ({ editModeTeamId })),
  reset: () =>
    set(() => ({
      data: undefined,
      editMode: false,
      editModeTeamId: undefined,
    })),
}));

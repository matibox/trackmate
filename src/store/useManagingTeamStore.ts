import { create } from 'zustand';
import { type RouterOutputs } from '../utils/api';

type ManagingTeamStore = {
  team: RouterOutputs['team']['getManagingFor'] | undefined;
  setTeam: (team: ManagingTeamStore['team']) => void;
  deleteTeamPopup: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
  createTeamPopup: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
};

export const useManagingTeamStore = create<ManagingTeamStore>()(set => ({
  team: undefined,
  setTeam: team => set(() => ({ team })),
  deleteTeamPopup: {
    isOpened: false,
    open: () =>
      set(state => ({
        deleteTeamPopup: { ...state.deleteTeamPopup, isOpened: true },
      })),
    close: () =>
      set(state => ({
        deleteTeamPopup: { ...state.deleteTeamPopup, isOpened: false },
      })),
  },
  createTeamPopup: {
    isOpened: false,
    open: () =>
      set(state => ({
        createTeamPopup: { ...state.createTeamPopup, isOpened: true },
      })),
    close: () =>
      set(state => ({
        createTeamPopup: { ...state.createTeamPopup, isOpened: false },
      })),
  },
}));

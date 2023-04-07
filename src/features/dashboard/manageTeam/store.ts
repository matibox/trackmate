import { create } from 'zustand';
import { type RouterOutputs } from '~/utils/api';

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
  editTeamPopup: {
    isOpened: boolean;
    open: () => void;
    close: () => void;
  };
  deleteDriverPopup: {
    isOpened: boolean;
    driverId: string | undefined;
    driverName: string | undefined;
    open: (driverId: string, driverName: string | undefined) => void;
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
  editTeamPopup: {
    isOpened: false,
    open: () =>
      set(state => ({
        editTeamPopup: { ...state.editTeamPopup, isOpened: true },
      })),
    close: () =>
      set(state => ({
        editTeamPopup: { ...state.editTeamPopup, isOpened: false },
      })),
  },
  deleteDriverPopup: {
    isOpened: false,
    driverId: undefined,
    driverName: undefined,
    open: (driverId, driverName) =>
      set(state => ({
        deleteDriverPopup: {
          ...state.deleteDriverPopup,
          driverId,
          driverName,
          isOpened: true,
        },
      })),
    close: () =>
      set(state => ({
        deleteDriverPopup: {
          ...state.deleteDriverPopup,
          driverId: undefined,
          isOpened: false,
        },
      })),
  },
}));

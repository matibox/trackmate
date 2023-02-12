import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsStore = {
  opened: boolean;
  open: () => void;
  close: () => void;
  settings: {
    showTeamEvents: boolean;
  };
  hideTeamEventsFn: () => void;
  showTeamEventsFn: () => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      opened: false,
      open: () => set(() => ({ opened: true })),
      close: () => set(() => ({ opened: false })),
      settings: {
        showTeamEvents: false,
      },
      hideTeamEventsFn: () =>
        set(state => ({
          settings: {
            ...state.settings,
            showTeamEvents: false,
          },
        })),
      showTeamEventsFn: () =>
        set(state => ({
          settings: {
            ...state.settings,
            showTeamEvents: true,
          },
        })),
    }),
    {
      name: 'settings',
      partialize: state => ({ settings: state.settings }),
    }
  )
);

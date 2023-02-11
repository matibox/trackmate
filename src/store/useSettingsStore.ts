import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsStore = {
  opened: boolean;
  open: () => void;
  close: () => void;
  settings: {
    showTeamEvents: boolean;
  };
  toggleTeamEvents: () => void;
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
      toggleTeamEvents: () =>
        set(state => ({
          settings: {
            ...state.settings,
            showTeamEvents: !state.settings.showTeamEvents,
          },
        })),
    }),
    {
      name: 'settings',
      partialize: state => ({ settings: state.settings }),
    }
  )
);

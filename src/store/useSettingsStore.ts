import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type EventDurationType = 'minutes' | 'hours';

type SettingsStore = {
  opened: boolean;
  open: () => void;
  close: () => void;
  settings: {
    showTeamEvents: boolean;
    eventDurationType: EventDurationType;
  };
  setShowTeamEvents: (show: boolean) => void;
  setEventDurationType: (type: EventDurationType) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      opened: false,
      open: () => set(() => ({ opened: true })),
      close: () => set(() => ({ opened: false })),
      settings: {
        showTeamEvents: false,
        eventDurationType: 'minutes',
      },
      setShowTeamEvents: show =>
        set(state => ({
          settings: { ...state.settings, showTeamEvents: show },
        })),
      setEventDurationType: type =>
        set(state => ({
          settings: { ...state.settings, eventDurationType: type },
        })),
    }),
    {
      name: 'settings',
      partialize: state => ({ settings: state.settings }),
    }
  )
);

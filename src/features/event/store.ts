import { create } from 'zustand';

type Tab = {
  id: number;
  label: string;
  selected: boolean;
};

const tabs = [
  {
    id: 0,
    label: 'Information',
    selected: true,
  },
  {
    id: 1,
    label: 'Drivers',
    selected: false,
  },
  {
    id: 2,
    label: 'Setups',
    selected: false,
  },
  {
    id: 3,
    label: 'Stints',
    selected: false,
  },
] as const satisfies readonly Tab[];

export type TabLabel = (typeof tabs)[number]['label'];

type EventTabStore = {
  tabs: Tab[];
  selectTab: (id: number) => void;
  getSelectedTab: () => Tab;
};

export const useEventTabsStore = create<EventTabStore>()((set, get) => ({
  tabs: [...tabs],
  selectTab: id =>
    set(state => ({
      tabs: state.tabs.map(tab => ({
        ...tab,
        selected: tab.id === id ? true : false,
      })),
    })),
  getSelectedTab: () => get().tabs.find(tab => tab.selected) as Tab,
}));

type EventSetupAssignStore = {
  eventId: string | null;
  isOpened: boolean;
  open: (eventId: string) => void;
  close: () => void;
};

export const useEventSetupAssignStore = create<EventSetupAssignStore>()(
  set => ({
    eventId: null,
    isOpened: false,
    open: setupId => set(() => ({ eventId: setupId, isOpened: true })),
    close: () => set(() => ({ eventId: null, isOpened: false })),
  })
);

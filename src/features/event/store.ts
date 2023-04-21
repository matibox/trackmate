import { create } from 'zustand';

type Tab = {
  id: number;
  label: string;
  selected: boolean;
};

type EventStore = {
  tabs: Tab[];
  selectTab: (id: number) => void;
  getSelectedTab: () => Tab;
};

export const useEventStore = create<EventStore>()((set, get) => ({
  tabs: [
    {
      id: 0,
      label: 'Information',
      selected: true,
      disabled: false,
    },
    {
      id: 1,
      label: 'Drivers',
      selected: false,
      disabled: false,
    },
    {
      id: 2,
      label: 'Setups',
      selected: false,
      disabled: false,
    },
    {
      id: 3,
      label: 'Result',
      selected: false,
      disabled: true,
    },
  ],
  selectTab: id =>
    set(state => ({
      tabs: state.tabs.map(tab => ({
        ...tab,
        selected: tab.id === id ? true : false,
      })),
    })),
  getSelectedTab: () => get().tabs.find(tab => tab.selected) as Tab,
}));

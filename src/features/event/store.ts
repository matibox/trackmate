import { create } from 'zustand';
import { type RouterOutputs } from '~/utils/api';

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
  isOpened: boolean;
  open: () => void;
  close: () => void;
};

export const useEventSetupAssignStore = create<EventSetupAssignStore>()(
  set => ({
    isOpened: false,
    open: () => set(() => ({ isOpened: true })),
    close: () => set(() => ({ isOpened: false })),
  })
);

type Setup = RouterOutputs['event']['single']['setups'][number];

type EventSetupFeedbackStore = {
  setup: Setup | undefined;
  isOpened: boolean;
  open: (setup: Setup) => void;
  close: () => void;
  isSetupFeedbackOpened: (setupId: string) => boolean;
};

export const useEventSetupFeedbackStore = create<EventSetupFeedbackStore>()(
  (set, get) => ({
    setup: undefined,
    isOpened: false,
    open: setup => set(() => ({ setup, isOpened: true })),
    close: () => set(() => ({ setup: undefined, isOpened: false })),
    isSetupFeedbackOpened: setupId => {
      return get().setup?.id === setupId && get().isOpened;
    },
  })
);

type PostFeedbackStore = {
  setupId: undefined | string;
  isOpened: boolean;
  open: (setupId: string) => void;
  close: () => void;
};

export const usePostFeedbackStore = create<PostFeedbackStore>()(set => ({
  setupId: undefined,
  isOpened: false,
  open: setupId => set(() => ({ setupId, isOpened: true })),
  close: () => set(() => ({ setupId: undefined, isOpened: false })),
}));

type AddStintStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
};

export const useAddStintStore = create<AddStintStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () => set(() => ({ isOpened: false })),
}));

type DeleteStintStore = {
  isOpened: boolean;
  open: (stintId: string) => void;
  close: () => void;
  stintId: string | undefined;
};

export const useDeleteStintStore = create<DeleteStintStore>()(set => ({
  isOpened: false,
  open: stintId => set(() => ({ isOpened: true, stintId })),
  close: () => set(() => ({ isOpened: false, stintId: undefined })),
  stintId: undefined,
}));

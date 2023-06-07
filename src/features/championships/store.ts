import { create } from 'zustand';

type Championship = {
  id: string;
  title: string;
  organizer: string;
};

type ResultStore = {
  isOpened: boolean;
  open: (championship: Championship) => void;
  close: () => void;
  championship: Championship | undefined;
};

export const useChampResultStore = create<ResultStore>()(set => ({
  isOpened: false,
  open: championship => set(() => ({ isOpened: true, championship })),
  close: () => set(() => ({ isOpened: false, championship: undefined })),
  championship: undefined,
}));

type Driver = { id: string; name: string | null };
type RosterChampionship = Championship & { roster: Driver[] };

type EditRosterStore = {
  isOpened: boolean;
  open: (championship: RosterChampionship) => void;
  close: () => void;
  championship: RosterChampionship | undefined;
};

export const useEditRosterStore = create<EditRosterStore>()(set => ({
  isOpened: false,
  open: championship => set(() => ({ isOpened: true, championship })),
  close: () => set(() => ({ isOpened: false, championship: undefined })),
  championship: undefined,
}));

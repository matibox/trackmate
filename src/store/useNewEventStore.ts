import type { formSchema } from '@dashboard/events/NewEvent';
import type { z } from 'zod';
import { create } from 'zustand';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type allKeys<T> = T extends any ? keyof T : never;

type NewEventStore = {
  isOpened: boolean;
  open: () => void;
  close: () => void;
  formState: z.infer<typeof formSchema>;
  setFormState: (formState: Partial<NewEventStore['formState']>) => void;
  errors:
    | { [P in allKeys<NewEventStore['formState']>]?: string[] | undefined }
    | undefined;
  setErrors: (errors: NewEventStore['errors']) => void;
};

export const defaultFormState: NewEventStore['formState'] = {
  newEventType: 'oneOff',
  championship: null,
  title: '',
  car: '',
  track: '',
  drivers: [],
  type: null,
  duration: 0,
  time: '00:00',
};

export const useNewEventStore = create<NewEventStore>()(set => ({
  isOpened: false,
  open: () => set(() => ({ isOpened: true })),
  close: () =>
    set(() => ({
      isOpened: false,
      formState: defaultFormState,
    })),
  formState: defaultFormState,
  setFormState: formState =>
    set(state => ({
      ...state,
      formState: { ...state.formState, ...formState },
    })),
  errors: undefined,
  setErrors: errors => set(() => ({ errors })),
}));

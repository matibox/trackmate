import { type z } from 'zod';
import { type step1Schema } from '../components/Step1';
import { create } from 'zustand';
import { type step2SingleSchema } from '../components/Step2Single';
import { type step3SingleSchema } from '../components/Step3Single';
import { objKeys } from '~/lib/utils';
import { type step4SingleSchema } from '../components/Step4Single';

const stepVariant = {
  '1': 'stepOne',
  '2-single': 'stepTwoSingle',
  '3-single': 'stepThreeSingle',
  '4-single': 'stepFourSingle',
} as const;

export type StepId = keyof typeof stepVariant;

type StepOneData = z.infer<typeof step1Schema>;
type StepTwoSingleData = z.infer<typeof step2SingleSchema>;
type StepThreeSingleData = z.infer<typeof step3SingleSchema>;
type StepFourSingleData = z.infer<typeof step4SingleSchema>;

type SetDataType =
  | { step: '1'; data: Partial<StepOneData> }
  | { step: '2-single'; data: Partial<StepTwoSingleData> }
  | { step: '3-single'; data: Partial<StepThreeSingleData> }
  | { step: '4-single'; data: Partial<StepFourSingleData> };

export const useNewEvent = create<{
  sheetOpened: boolean;
  setSheetOpened: (opened: boolean) => void;
  stepId: StepId;
  setStep: (stepId: StepId) => void;
  steps: {
    stepOne: StepOneData | null;
    stepTwoSingle: StepTwoSingleData | null;
    stepThreeSingle: StepThreeSingleData | null;
    stepFourSingle: StepFourSingleData | null;
  };
  setData: ({ step, data }: SetDataType) => void;
  reset: () => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  editModeEventId: string | undefined;
  setEditModeEventId: (eventId: string | undefined) => void;
}>((set, get) => ({
  sheetOpened: false,
  setSheetOpened: sheetOpened => set(() => ({ sheetOpened })),
  stepId: '1',
  setStep: stepId => set(() => ({ stepId })),
  steps: {
    stepOne: null,
    stepTwoSingle: null,
    stepThreeSingle: null,
    stepFourSingle: null,
  },
  setData: ({ step, data }) =>
    set(state => ({
      steps: {
        ...state.steps,
        [stepVariant[step]]: { ...state.steps[stepVariant[step]], ...data },
      },
    })),
  reset: () =>
    set(() => {
      setTimeout(() => get().setStep('1'), 500);

      const steps = { ...get().steps };
      objKeys(steps).forEach(k => (steps[k] = null));

      return { steps, editMode: false, editModeEventId: undefined };
    }),
  editMode: false,
  setEditMode: editMode => set(() => ({ editMode })),
  editModeEventId: undefined,
  setEditModeEventId: editModeEventId => set(() => ({ editModeEventId })),
}));

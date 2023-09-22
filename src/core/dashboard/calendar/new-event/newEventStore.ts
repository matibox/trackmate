import { type z } from 'zod';
import { type stepOneSchema } from './StepOne';
import { create } from 'zustand';
import { type stepTwoSingleSchema } from './StepTwoSingle';
import { type stepThreeSingleSchema } from './StepThreeSingle';
import { objKeys } from '~/lib/utils';
import { type stepFourSingleSchema } from './StepFourSingle';

const stepVariant = {
  '1': 'stepOne',
  '2-single': 'stepTwoSingle',
  '3-single': 'stepThreeSingle',
  '4-single': 'stepFourSingle',
} as const;

export type StepId = keyof typeof stepVariant;

type StepOneData = z.infer<typeof stepOneSchema>;
type StepTwoSingleData = z.infer<typeof stepTwoSingleSchema>;
type StepThreeSingleData = z.infer<typeof stepThreeSingleSchema>;
type StepFourSingleData = z.infer<typeof stepFourSingleSchema>;

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

      return { steps };
    }),
}));

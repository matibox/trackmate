import { type z } from 'zod';
import { type stepOneSchema } from './StepOne';
import { create } from 'zustand';
import { type stepTwoSingleSchema } from './StepTwoSingle';
import { type stepThreeSingleSchema } from './StepThreeSingle';

const stepVariant = {
  '1': 'stepOne',
  '2-single': 'stepTwoSingle',
  '3-single': 'stepThreeSingle',
  '4-single': 'stepFourSingle',
};

export type StepId = keyof typeof stepVariant;

type StepOneData = z.infer<typeof stepOneSchema>;
type StepTwoSingleData = z.infer<typeof stepTwoSingleSchema>;
type StepThreeSingleData = z.infer<typeof stepThreeSingleSchema>;
// type StepThreeJoinTeamData = z.infer<typeof stepThreeJoinTeamSchema>;

type setDataType =
  | { step: '1'; data: StepOneData }
  | { step: '2-single'; data: StepTwoSingleData }
  | { step: '3-single'; data: StepThreeSingleData };
//   | { step: '3-join'; data: StepThreeJoinTeamData };

export const useNewEvent = create<{
  stepId: StepId;
  setStep: (stepId: StepId) => void;
  stepOne: StepOneData | null;
  stepTwoSingle: StepTwoSingleData | null;
  stepThreeSingle: StepThreeSingleData | null;
  // stepThreeJoin: StepThreeJoinTeamData | null;
  setData: ({ step, data }: setDataType) => void;
  reset: () => void;
}>((set, get) => ({
  stepId: '1',
  setStep: stepId => set(() => ({ stepId })),
  stepOne: null,
  stepTwoSingle: null,
  stepThreeSingle: null,
  // stepThreeJoin: null,
  setData: ({ step, data }) =>
    set(state => ({
      ...state,
      [stepVariant[step]]: data,
    })),
  reset: () =>
    set(() => {
      setTimeout(() => get().setStep('1'), 500);
      return {
        stepOne: null,
        stepTwoSingle: null,
      };
    }),
}));

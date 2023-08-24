import { type z } from 'zod';
import { create } from 'zustand';
import { type stepOneSchema } from '../components/StepOne';
import { type stepTwoSchema } from '../components/StepTwo';
import { type stepThreeCreateTeamSchema } from '../components/StepThree';

const stepVariant = {
  '1': 'stepOne',
  '2': 'stepTwo',
  '3-create': 'stepThreeCreate',
  // '3-join': 'stepThreeJoin',
};

type StepOneData = z.infer<typeof stepOneSchema>;
type StepTwoData = z.infer<typeof stepTwoSchema>;
type StepThreeCreateTeamData = z.infer<typeof stepThreeCreateTeamSchema>;

type setDataType =
  | { step: '1'; data: StepOneData }
  | { step: '2'; data: StepTwoData }
  | { step: '3-create'; data: StepThreeCreateTeamData };
// | { step: '3-join'; data: StepThreeCreateTeamData };

export const useWelcomeForm = create<{
  stepIndex: number;
  nextStep: () => void;
  stepOne: StepOneData | null;
  stepTwo: StepTwoData | null;
  stepThreeCreate: StepThreeCreateTeamData | null;
  setData: ({ step, data }: setDataType) => void;
}>(set => ({
  stepIndex: 0,
  nextStep: () => set(state => ({ stepIndex: state.stepIndex + 1 })),
  stepOne: null,
  stepTwo: null,
  stepThreeCreate: null,
  setData: ({ step, data }) =>
    set(state => ({
      ...state,
      [stepVariant[step]]: data,
    })),
}));

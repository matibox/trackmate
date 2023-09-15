import { type z } from 'zod';
import { type eventTypeSchema } from './StepOne';
import { create } from 'zustand';

const stepVariant = {
  '1': 'stepOne',
  // '2': 'stepTwo',
  // '3-create': 'stepThreeCreate',
  // '3-join': 'stepThreeJoin',
};

type StepOneData = z.infer<typeof eventTypeSchema>;
// type StepTwoData = z.infer<typeof stepTwoSchema>;
// type StepThreeCreateTeamData = z.infer<typeof stepThreeCreateTeamSchema>;
// type StepThreeJoinTeamData = z.infer<typeof stepThreeJoinTeamSchema>;

type setDataType = { step: '1'; data: StepOneData };
//   | { step: '2'; data: StepTwoData }
//   | { step: '3-create'; data: StepThreeCreateTeamData }
//   | { step: '3-join'; data: StepThreeJoinTeamData };

export const useNewEvent = create<{
  stepIndex: number;
  nextStep: () => void;
  previousStep: () => void;
  stepOne: StepOneData | null;
  // stepTwo: StepTwoData | null;
  // stepThreeCreate: StepThreeCreateTeamData | null;
  // stepThreeJoin: StepThreeJoinTeamData | null;
  setData: ({ step, data }: setDataType) => void;
}>(set => ({
  stepIndex: 0,
  nextStep: () => set(state => ({ stepIndex: state.stepIndex + 1 })),
  previousStep: () => set(state => ({ stepIndex: state.stepIndex - 1 })),
  stepOne: null,
  // stepTwo: null,
  // stepThreeCreate: null,
  // stepThreeJoin: null,
  setData: ({ step, data }) =>
    set(state => ({
      ...state,
      [stepVariant[step]]: data,
    })),
}));

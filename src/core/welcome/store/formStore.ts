import { create } from 'zustand';

type FormStore = {
  stepIndex: number;
  nextStep: () => void;
};

export const useWelcomeForm = create<FormStore>()(set => ({
  stepIndex: 0,
  nextStep: () => set(state => ({ stepIndex: state.stepIndex + 1 })),
}));

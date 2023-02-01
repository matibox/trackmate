import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { type Schema } from 'zod';
import useForm from '../../../hooks/useForm';

export function useMultistepForm<T>(
  steps: ReactNode[],
  formSchema: Schema<T>,
  onSubmit: (values: T) => void
) {
  const [stepIndex, setStepIndex] = useState(0);
  const { handleSubmit, errors } = useForm(formSchema, onSubmit);

  const next = useCallback(() => {
    setStepIndex(prev => prev + 1);
  }, []);

  const prev = useCallback(() => {
    setStepIndex(prev => prev - 1);
  }, []);

  const isFirst = useMemo(() => {
    return stepIndex === 0;
  }, [stepIndex]);

  const isLast = useMemo(() => {
    return stepIndex === steps.length - 1;
  }, [stepIndex, steps.length]);

  return {
    step: steps[stepIndex],
    next,
    prev,
    handleSubmit,
    errors,
    isFirst,
    isLast,
  };
}

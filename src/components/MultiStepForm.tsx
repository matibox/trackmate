import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ZodSchema, z } from 'zod';
import { Button } from '~/components/ui/Button';

export default function MultiStepForm<T extends ZodSchema>({
  steps,
  onSubmit,
  defaultValues,
}: {
  steps: Array<{ schema: ZodSchema; component: ReactNode }>;
  onSubmit: (values: z.infer<T>) => void;
  defaultValues?: z.infer<T>;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep]!;

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(step.schema),
    defaultValues,
  });

  const isLastStep = useMemo(
    () => currentStep === steps.length - 1,
    [currentStep, steps.length]
  );

  function handleNextStep() {
    console.log('beng');
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(form.getValues());
    }
  }

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleNextStep)}>
        {step.component}
        {currentStep > 0 && (
          <Button
            type='button'
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            Previous
          </Button>
        )}
        <Button type='submit'>{isLastStep ? 'submit' : 'next'}</Button>
      </form>
    </FormProvider>
  );
}

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
  defaultValues?: Partial<z.infer<T>>;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep]!;

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(step.schema),
    defaultValues: defaultValues as z.infer<T>,
  });

  const isLastStep = useMemo(
    () => currentStep === steps.length - 1,
    [currentStep, steps.length]
  );

  function handleNextStep() {
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
        <div className='mx-auto flex w-4/5'>
          {currentStep > 0 && (
            <Button
              type='button'
              variant='secondary'
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
          <Button type='submit' className='ml-auto'>
            {isLastStep ? 'Submit' : 'Next'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

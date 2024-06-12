import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { CalendarPlusIcon } from 'lucide-react';
import { type StepId, useNewEvent } from './newEventStore';
import { useState, type ReactNode } from 'react';
import Step1 from './Step1';
import Step2Single from './Step2Single';
import Step3Single from './Step3Single';
import Step4Single from './Step4Single';
import MultiStepForm from '~/components/MultiStepForm';
import { z } from 'zod';
import StepOne, { stepOneSchema } from '../new-event-2/Step1';
import StepTwo, { stepTwoSchema } from '../new-event-2/Step2';
import StepThree, { stepThreeSchema } from '../new-event-2/Step3';

// const steps: Record<StepId, ReactNode> = {
//   '1': <Step1 />,
//   '2-single': <Step2Single />,
//   '3-single': <Step3Single />,
//   '4-single': <Step4Single />,
// };

const formSchema = stepOneSchema.and(stepTwoSchema);

export default function NewEvent() {
  const [sheetOpened, setSheetOpened] = useState(false);

  // const { stepId, reset } = useNewEvent();

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger
        asChild
        //  className='lg:hidden'
      >
        <Button
          variant='fab'
          size='fab'
          className='fixed bottom-24 right-4'
          aria-label='Create event'
        >
          <CalendarPlusIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        className='w-full border-0 ring-1 ring-slate-900'
        // onClose={reset}
      >
        <MultiStepForm<typeof formSchema>
          onSubmit={values => {
            console.log(values);
          }}
          steps={[
            { schema: stepOneSchema, component: <StepOne /> },
            { schema: stepTwoSchema, component: <StepTwo /> },
            { schema: stepThreeSchema, component: <StepThree /> },
          ]}
          defaultValues={{
            name: '',
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { useState } from 'react';
import MultiStepForm from '~/components/MultiStepForm';
import StepOne, { stepOneSchema } from '../new-event-2/Step1';
import StepTwo, { stepTwoSchema } from '../new-event-2/Step2';
import StepThree, { stepThreeSchema } from '../new-event-2/Step3';
import { CalendarPlusIcon } from 'lucide-react';

export const formSchema = stepOneSchema.and(stepTwoSchema).and(stepThreeSchema);

export default function NewEvent() {
  const [sheetOpened, setSheetOpened] = useState(false);

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild>
        <Button
          variant='fab'
          size='fab'
          className='fixed bottom-24 right-4'
          aria-label='Create event'
        >
          <CalendarPlusIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full border-0 ring-1 ring-slate-900'>
        <MultiStepForm<typeof formSchema>
          onSubmit={values => {
            console.log('outer', values);
          }}
          steps={[
            { schema: stepOneSchema, component: <StepOne /> },
            { schema: stepTwoSchema, component: <StepTwo /> },
            { schema: stepThreeSchema, component: <StepThree /> },
          ]}
          defaultValues={{
            name: '',
            sessions: [],
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

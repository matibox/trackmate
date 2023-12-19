import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { CalendarPlusIcon } from 'lucide-react';
import { type StepId, useNewEvent } from '../store/newEventStore';
import { type ReactNode } from 'react';
import Step1 from './Step1';
import Step2Single from './Step2Single';
import Step3Single from './Step3Single';
import Step4Single from './Step4Single';
import Step5 from './Step5';

const steps: Record<StepId, ReactNode> = {
  '1': <Step1 />,
  '2-single': <Step2Single />,
  '3-single': <Step3Single />,
  '4-single': <Step4Single />,
  '5': <Step5 />,
};

export default function NewEvent() {
  const { stepId, reset, sheetOpened, setSheetOpened } = useNewEvent();

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild className='lg:hidden'>
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
        onClose={reset}
      >
        {steps[stepId]}
      </SheetContent>
    </Sheet>
  );
}

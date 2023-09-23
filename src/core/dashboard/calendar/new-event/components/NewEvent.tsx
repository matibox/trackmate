import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { CalendarPlusIcon } from 'lucide-react';
import { type StepId, useNewEvent } from '../store/newEventStore';
import { type ReactNode } from 'react';
import EventType from './StepOne';
import StepTwoSingle from './StepTwoSingle';
import StepThreeSingle from './StepThreeSingle';
import StepFourSingle from './StepFourSingle';

const steps: Record<StepId, ReactNode> = {
  '1': <EventType />,
  '2-single': <StepTwoSingle />,
  '3-single': <StepThreeSingle />,
  '4-single': <StepFourSingle />,
};

export default function NewEvent() {
  const { stepId, reset, sheetOpened, setSheetOpened } = useNewEvent();

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild>
        <Button
          variant='fab'
          size='fab'
          className='absolute bottom-24 right-4'
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

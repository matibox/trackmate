import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { CalendarPlusIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { useNewEvent } from './newEventStore';
import EventType from './StepOne';
import StepTwoSingle from './StepTwoSingle';
import StepThreeSingle from './StepThreeSingle';
import StepFourSingle from './StepFourSingle';

const steps: ReactNode[] = [
  <EventType key={1} />,
  <StepTwoSingle key={2} />,
  <StepThreeSingle key={3} />,
  <StepFourSingle key={4} />,
];

export default function NewEvent() {
  const { stepIndex, reset } = useNewEvent();

  return (
    <Sheet>
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
        {steps[stepIndex]}
      </SheetContent>
    </Sheet>
  );
}

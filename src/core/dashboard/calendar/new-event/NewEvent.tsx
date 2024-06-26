import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import MultiStepForm from '~/components/MultiStepForm';
import StepOne, { stepOneSchema } from './Step1';
import StepTwo, { stepTwoSchema } from './Step2';
import StepThree, { stepThreeSchema } from './Step3';
import { CalendarPlusIcon } from 'lucide-react';
import { create } from 'zustand';

export const useNewEvent = create<{
  sheetOpened: boolean;
  setSheetOpened: (open: boolean) => void;
}>()(set => ({
  sheetOpened: false,
  setSheetOpened: open => set(() => ({ sheetOpened: open })),
}));

export const formSchema = stepOneSchema.and(stepTwoSchema).and(stepThreeSchema);

export default function NewEvent() {
  const { sheetOpened, setSheetOpened } = useNewEvent();

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild>
        <Button
          variant='fab'
          size='fab'
          className='fixed bottom-24 right-4 lg:hidden'
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

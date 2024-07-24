import { Button } from '~/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import MultiStepForm from '~/components/MultiStepForm';
import StepOne, { stepOneSchema } from './Step1';
import StepTwo, { stepTwoSchema, stepTwoValues } from './Step2';
import StepThree, { stepThreeSchema, stepThreeValues } from './Step3';
import { CalendarPlusIcon } from 'lucide-react';
import { create } from 'zustand';
import { api } from '~/utils/api';
import { useToast } from '~/components/ui/useToast';
import { useCalendar } from '../store';
import dayjs from 'dayjs';

export const useNewEvent = create<{
  sheetOpened: boolean;
  setSheetOpened: (open: boolean) => void;
}>()(set => ({
  sheetOpened: false,
  setSheetOpened: open => set(() => ({ sheetOpened: open })),
}));

export const newEventSchema = stepOneSchema
  .extend(stepTwoValues)
  .extend(stepThreeValues);

export default function NewEvent() {
  const { sheetOpened, setSheetOpened } = useNewEvent();
  const { selectDay } = useCalendar();
  const { toast } = useToast();

  const utils = api.useContext();
  const { mutateAsync: createEvent, status } = api.event.create.useMutation({
    onError: err => {
      toast({
        variant: 'destructive',
        title: 'An error occured',
        description: err.message,
      });
    },
    onSuccess: async event => {
      toast({
        variant: 'default',
        title: 'Success!',
        description: 'An event has successfully been created',
      });

      await utils.event.invalidate();
      setSheetOpened(false);

      const firstSessionDate = dayjs(event.sessions[0]?.start);
      selectDay({ day: firstSessionDate });
    },
  });

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
        <MultiStepForm<typeof newEventSchema>
          onSubmit={async values => {
            await createEvent(values);
          }}
          loading={status === 'loading'}
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

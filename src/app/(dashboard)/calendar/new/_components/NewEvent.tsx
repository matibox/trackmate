'use client';

import { useRouter } from 'next/navigation';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { digit8StrToDate } from '~/lib/dates';
import Step1, { stepOneSchema } from './Step1';
import MultiStepForm from '~/components/MultistepForm';
import { useDashboardContext } from '~/app/(dashboard)/_components/DashboardContext';

const newEventSchema = stepOneSchema;

export default function NewEvent({
  selectedDateStr,
}: {
  selectedDateStr: string;
}) {
  const router = useRouter();
  const selectedDate = digit8StrToDate(selectedDateStr);
  const { selectedTeam, selectTeam } = useDashboardContext();

  return (
    <Sheet
      defaultOpen
      onOpenChange={open => {
        if (!open) router.push('/calendar');
      }}
    >
      <SheetContent
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <MultiStepForm<typeof newEventSchema>
          onSubmit={values => {
            console.log(values);
          }}
          steps={[
            {
              schema: stepOneSchema,
              component: <Step1 />,
            },
          ]}
          defaultValues={{
            name: '',
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

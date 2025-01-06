'use client';

import { useRouter } from 'next/navigation';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { digit8StrToDate } from '~/lib/dates';
import Step1, { stepOneSchema } from './Step1';
import MultiStepForm from '~/components/MultistepForm';
import Step2, { stepTwoSchema } from './Step2';
import { useDashboardContext } from '~/app/(dashboard)/_components/DashboardContext';
import { type Session } from 'next-auth';

const newEventSchema = stepOneSchema.and(stepTwoSchema);

export default function NewEvent({
  selectedDateStr,
  user,
}: {
  selectedDateStr: string;
  user: Session['user'];
}) {
  const router = useRouter();
  const selectedDate = digit8StrToDate(selectedDateStr);
  const { selectedTeam } = useDashboardContext();

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
            {
              schema: stepTwoSchema,
              component: (
                <Step2
                  user={{
                    id: user.id,
                    ...user.profile!,
                  }}
                />
              ),
            },
          ]}
          defaultValues={{
            date: selectedDate.toDate(),
            teamId: selectedTeam?.id,
            name: '',
            driverIds: [],
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

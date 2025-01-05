'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '~/components/ui/sheet';
import { digit8StrToDate } from '~/lib/dates';
import Step1, { stepOneSchema } from './Step1';
import MultiStepForm from '~/components/MultistepForm';
import { useDashboardContext } from '~/app/(dashboard)/_components/DashboardContext';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { cn } from '~/lib/utils';

const newEventSchema = stepOneSchema;

export default function NewEvent({
  selectedDateStr,
}: {
  selectedDateStr: string;
}) {
  const router = useRouter();
  const selectedDate = digit8StrToDate(selectedDateStr);
  const { selectedTeam, selectTeam, teams } = useDashboardContext();

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
        {teams.length === 0 ? (
          <>
            <SheetTitle>Create an event</SheetTitle>
            <SheetDescription>
              Please{' '}
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'h-auto p-0'
                )}
              >
                create
              </Link>{' '}
              or join a team to continue.
            </SheetDescription>
          </>
        ) : (
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
        )}
      </SheetContent>
    </Sheet>
  );
}

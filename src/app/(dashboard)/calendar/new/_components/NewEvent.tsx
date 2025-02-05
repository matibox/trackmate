'use client';

import { useRouter } from 'next/navigation';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { digit8StrToDate } from '~/lib/dates';
import Step1 from './Step1';
import MultiStepForm from '~/components/MultistepForm';
import Step2 from './Step2';
import { useDashboardContext } from '~/app/(dashboard)/_components/DashboardContext';
import { type Session } from 'next-auth';
import {
  type newEventSchema,
  stepOneSchema,
  stepTwoSchema,
} from './formSchema';
import { api } from '~/trpc/react';
import { useToast } from '~/hooks/use-toast';

export default function NewEvent({
  selectedDateStr,
  user,
}: {
  selectedDateStr: string;
  user: Session['user'];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const selectedDate = digit8StrToDate(selectedDateStr);
  const { selectedTeam } = useDashboardContext();

  const createEvent = api.event.create.useMutation({
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: 'An unknown error occured.',
      });
    },
    onSuccess: async event => {
      // TODO invalidate queries
      // await utils.user.teams.invalidate();
      toast({
        variant: 'default',
        title: 'Success',
        description: 'An event has been created.',
      });

      router.back();
    },
  });

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
          onSubmit={values => createEvent.mutate(values)}
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

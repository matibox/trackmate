import { useState } from 'react';
import { api } from '~/utils/api';
import { useCalendar } from '../store';
import { useToast } from '~/components/ui/useToast';
import dayjs from 'dayjs';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import { PencilIcon } from 'lucide-react';
import MultiStepForm from '~/components/MultiStepForm';
import { type newEventSchema } from '../new-event/NewEvent';
import StepOne, { stepOneSchema } from '../new-event/Step1';
import StepTwo, { stepTwoSchema } from '../new-event/Step2';
import StepThree, { stepThreeSchema } from '../new-event/Step3';
import { dateToTimeString, replaceAll } from '~/lib/utils';
import { type Event } from './EventDropdown';

export default function EditEventSheet({ event }: { event: Event }) {
  const [sheetOpened, setSheetOpened] = useState(false);
  const selectDay = useCalendar(s => s.selectDay);
  const { toast } = useToast();

  const utils = api.useContext();
  const { mutateAsync: editEvent, status } = api.event.edit.useMutation({
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
        description: 'An event has successfully been edited',
      });

      await utils.event.invalidate();
      setSheetOpened(false);

      const firstSessionDate = dayjs(event.sessions[0]?.start);
      selectDay({ day: firstSessionDate });
    },
  });

  const driverIds = [
    ...new Set(
      event.sessions
        .map(s => s.drivers)
        .flat()
        .map(d => d.id)
    ),
  ];

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          <PencilIcon className='mr-2 h-4 w-4' />
          <span>Edit event</span>
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className='w-full border-0 ring-1 ring-slate-900'>
        <MultiStepForm<typeof newEventSchema>
          onSubmit={async values => {
            await editEvent({
              eventId: event.id,
              ...values,
            });
          }}
          loading={status === 'loading'}
          steps={[
            { schema: stepOneSchema, component: <StepOne edit /> },
            { schema: stepTwoSchema, component: <StepTwo edit /> },
            { schema: stepThreeSchema, component: <StepThree edit /> },
          ]}
          defaultValues={{
            name: event.name,
            game: replaceAll(event.game, '_', ' '),
            track: event.track ?? undefined,
            car: event.car ?? undefined,
            teamId: event.roster?.team.id,
            rosterId: event.roster?.id,
            driverIds,
            sessions: event.sessions.map(s => {
              const startTime = dateToTimeString(s.start);
              const endTime = s.end ? dateToTimeString(s.end) : '00:00';
              const driverIds = s.drivers.map(d => d.id);
              const endsNextDay = dayjs(s.start).date() !== dayjs(s.end).date();

              return {
                id: s.id,
                type: s.type,
                includeWeather: false,
                startTime,
                endTime,
                date: s.start,
                driverIds,
                endsNextDay,
                driverId: driverIds[0]!,
              };
            }),
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

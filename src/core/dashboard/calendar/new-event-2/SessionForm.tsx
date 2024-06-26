import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState, useMemo } from 'react';
import {
  type DefaultValues,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { z } from 'zod';
import ResponsiveDialog from '~/components/ui/ResponsiveDialog';
import { type sessionTypes } from '~/lib/constants';
import { timeStringToDate } from '~/lib/utils';
import { Button } from '~/components/ui/Button';
import { type stepThreeSchema } from './Step3';
import { type stepTwoSchema } from './Step2';
import { serverSettingsDefaultValues } from './ServerSettings';
import { weatherDefaultValues } from './Weather';
import Briefing, { briefingSchema } from './Briefing';
import Practice, { practiceSchema } from './Practice';
import Qualifying, { qualifyingSchema } from './Qualifying';
import Race, { raceSchema } from './Race';

type SessionType = (typeof sessionTypes)[number];

export const sessionSchema = z
  .discriminatedUnion('type', [
    briefingSchema,
    practiceSchema,
    qualifyingSchema,
    raceSchema,
  ])
  .superRefine((schema, ctx) => {
    if (!('endTime' in schema)) return;

    const start = timeStringToDate(schema.startTime);
    const end = timeStringToDate(schema.endTime);

    if (schema.type === 'race' && schema.endsNextDay) return;

    if (end.isBefore(start)) {
      ctx.addIssue({
        code: 'custom',
        fatal: true,
        message: 'End time must be after start time.',
        path: ['endTime'],
      });
    }
  });

export default function SessionForm({
  sessionType,
  onSubmit: handleSubmit,
  trigger,
  defaultValues,
}: {
  sessionType: SessionType;
  onSubmit: (values: z.infer<typeof sessionSchema>) => void;
  trigger: ReactNode;
  defaultValues?: DefaultValues<z.infer<typeof sessionSchema>>;
}) {
  const [isOpened, setIsOpened] = useState(false);

  const stepTwoForm = useFormContext<z.infer<typeof stepTwoSchema>>();
  const stepThreeForm = useFormContext<z.infer<typeof stepThreeSchema>>();

  const sessions = stepThreeForm.getValues('sessions');
  const lastSessionDate = [...sessions].pop()?.date;

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: defaultValues ?? {
      type: sessionType,
      date: lastSessionDate,
      startTime: '',
      endTime: '',
      driverIds: [],
      ...serverSettingsDefaultValues,
      ...weatherDefaultValues,
    },
  });

  const sessionTypeMap: Record<SessionType, ReactNode> = useMemo(
    () => ({
      briefing: <Briefing />,
      practice: <Practice />,
      qualifying: <Qualifying stepTwoForm={stepTwoForm} />,
      race: <Race stepTwoForm={stepTwoForm} />,
    }),
    [stepTwoForm]
  );

  return (
    <ResponsiveDialog
      key={sessionType}
      open={isOpened}
      onOpenChange={setIsOpened}
      title={`Create ${sessionType} session`}
      trigger={trigger}
    >
      <FormProvider {...form}>
        <form
          onSubmit={async e => {
            e.preventDefault();
            e.stopPropagation();

            await form.handleSubmit(values => {
              setIsOpened(false);
              handleSubmit(values);
            })();
          }}
        >
          <div className='mx-auto flex max-w-sm flex-col gap-4 px-4 pb-4 text-slate-50 md:px-0 md:pb-0'>
            {sessionTypeMap[sessionType]}
            <Button>Submit</Button>
          </div>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}

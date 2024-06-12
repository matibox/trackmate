import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { ZodSchema, z } from 'zod';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import ResponsiveDialog from '~/components/ui/ResponsiveDialog';
import { sessionTypes } from '~/lib/constants';
import { capitalize } from '~/lib/utils';
import { stepThreeSchema } from './Step3';

type SessionType = (typeof sessionTypes)[number];

const briefingSchema = z.object({
  date: z.date({ required_error: 'Date is required.' }),
  startTime: z
    .string({ required_error: 'Start time is required.' })
    .min(1, 'Start time is required.'),
});

const practiceSchema = z.object({});
const qualifyingSchema = z.object({});
const raceSchema = z.object({});

const sessionTypeMap: Record<SessionType, ReactNode> = {
  briefing: <BriefingForm />,
  practice: <PracticeForm />,
  qualifying: <QualifyingForm />,
  race: <RaceForm />,
};

function BriefingForm() {
  const form = useFormContext<z.infer<typeof briefingSchema>>();

  return <div>briefing form</div>;
}

function PracticeForm() {
  const form = useFormContext<z.infer<typeof practiceSchema>>();

  return <div>[practice]</div>;
}

function QualifyingForm() {
  const form = useFormContext<z.infer<typeof qualifyingSchema>>();

  return <div>qualifying</div>;
}

function RaceForm() {
  const form = useFormContext<z.infer<typeof raceSchema>>();

  return <div>race</div>;
}

export const sessionSchema = z.union([
  briefingSchema,
  practiceSchema,
  qualifyingSchema,
  raceSchema,
]);

export default function SessionForm({
  sessionType,
}: {
  sessionType: SessionType;
}) {
  const stepThreeForm = useFormContext<z.infer<typeof stepThreeSchema>>();

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      //
    },
  });

  return (
    <ResponsiveDialog
      key={sessionType}
      title={`Create ${sessionType} session`}
      trigger={
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          {capitalize(sessionType)}
        </DropdownMenuItem>
      }
    >
      <div className='flex flex-col gap-4 px-4 text-slate-50 md:px-0'>
        {sessionTypeMap[sessionType]}
      </div>
    </ResponsiveDialog>
  );
}

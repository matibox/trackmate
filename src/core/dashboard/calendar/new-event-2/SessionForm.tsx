import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { DropdownMenuItem } from '~/components/ui/DropdownMenu';
import ResponsiveDialog from '~/components/ui/ResponsiveDialog';
import { type sessionTypes } from '~/lib/constants';
import { capitalize, cn } from '~/lib/utils';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { Button } from '~/components/ui/Button';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '~/components/ui/Calendar';
import { Input } from '~/components/ui/Input';
import { stepThreeSchema } from './Step3';

type SessionType = (typeof sessionTypes)[number];

const briefingSchema = z.object({
  type: z.literal('briefing'),
  date: z.date({ required_error: 'Date is required.' }),
  startTime: z
    .string({ required_error: 'Start time is required.' })
    .min(1, 'Start time is required.'),
});

const practiceSchema = z.object({
  type: z.literal('practice', { required_error: 'type is required' }),
  date: z.date({ required_error: 'Date is required.' }),
  beng: z.string().min(1, 'yes'),
});

const qualifyingSchema = z.object({
  type: z.literal('qualifying'),
  date: z.date({ required_error: 'Date is required.' }),
  beng: z.string().min(1, 'yes'),
});

const raceSchema = z.object({
  type: z.literal('race'),
  date: z.date({ required_error: 'Date is required.' }),
  beng: z.string().min(1, 'yes'),
});

const sessionTypeMap: Record<SessionType, ReactNode> = {
  briefing: <BriefingForm />,
  practice: <PracticeForm />,
  qualifying: <QualifyingForm />,
  race: <RaceForm />,
};

function BriefingForm() {
  const form = useFormContext<z.infer<typeof briefingSchema>>();

  return (
    <>
      <FormField
        control={form.control}
        name='date'
        render={({ field }) => (
          <FormItem className='flex flex-col'>
            <FormLabel className='w-min'>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      dayjs(field.value).format('MMMM DD, YYYY')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='startTime'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start time</FormLabel>
            <FormControl>
              <Input {...field} type='time' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

function PracticeForm() {
  const form = useFormContext<z.infer<typeof practiceSchema>>();

  return <div>practice</div>;
}

function QualifyingForm() {
  const form = useFormContext<z.infer<typeof qualifyingSchema>>();

  return <div>qualifying</div>;
}

function RaceForm() {
  const form = useFormContext<z.infer<typeof raceSchema>>();

  return <div>race</div>;
}

export const sessionSchema = z.discriminatedUnion('type', [
  briefingSchema,
  practiceSchema,
  qualifyingSchema,
  raceSchema,
]);

export default function SessionForm({
  sessionType,
  onSubmit: handleSubmit,
}: {
  sessionType: SessionType;
  onSubmit: (values: z.infer<typeof sessionSchema>) => void;
}) {
  const [isOpened, setIsOpened] = useState(false);

  const stepThreeForm = useFormContext<z.infer<typeof stepThreeSchema>>();
  const sessions = stepThreeForm.getValues('sessions');
  const lastSessionDate = [...sessions].pop()?.date;

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      startTime: '',
      date: lastSessionDate,
    },
  });

  return (
    <ResponsiveDialog
      key={sessionType}
      open={isOpened}
      onOpenChange={setIsOpened}
      title={`Create ${sessionType} session`}
      trigger={
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          {capitalize(sessionType)}
        </DropdownMenuItem>
      }
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
            <FormField
              control={form.control}
              name='type'
              defaultValue={sessionType}
              render={() => <></>}
            />
            {sessionTypeMap[sessionType]}
            <Button>Submit</Button>
          </div>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}

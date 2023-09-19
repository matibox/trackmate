import { Form, useForm } from 'react-hook-form';
import { Button } from '~/components/ui/Button';
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { useNewEvent } from './newEventStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';

export const stepFourSingleSchema = z.object({
  sessions: z.array(
    z
      .discriminatedUnion('type', [
        // PRACTICE
        z.object({
          type: z.literal('practice'),
          end: z.date({ required_error: 'End time is required.' }),
        }),
        // BRIEFING
        z.object({
          type: z.literal('briefing'),
        }),
        // QUALIFYING
        z.object({
          type: z.literal('qualifying'),
          end: z.date({ required_error: 'End time is required.' }),
          driverId: z.string(),
        }),
        // RACE
        z.object({
          type: z.literal('race'),
          end: z.date({ required_error: 'End time is required.' }),
          driverIds: z.array(z.string()),
        }),
      ])
      .and(
        z.object({
          start: z.date({ required_error: 'Start time is required.' }),
        })
      )
  ),
});

export default function StepFourSingle() {
  const {
    setStep,
    steps: { stepFourSingle },
  } = useNewEvent();

  const form = useForm<z.infer<typeof stepFourSingleSchema>>({
    resolver: zodResolver(stepFourSingleSchema),
    defaultValues: {
      sessions: stepFourSingle?.sessions ?? [],
    },
  });

  function onSubmit(values: z.infer<typeof stepFourSingleSchema>) {
    console.log(values);
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create single event</SheetTitle>
        <SheetDescription>
          Define the race week. Click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid justify-center gap-4 py-8 text-slate-50'>
            <Button
              type='button'
              variant='secondary'
              className='w-[278px] justify-between'
            >
              New session
              <PlusIcon className='h-4 w-4' />
            </Button>
            <SheetFooter className='flex-row justify-between sm:justify-between'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setStep('3-single')}
              >
                Back
              </Button>
              <Button type='submit'>Next</Button>
            </SheetFooter>
          </div>
        </form>
      </Form>
    </>
  );
}

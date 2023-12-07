import { useForm } from 'react-hook-form';
import { Button } from '~/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '~/components/ui/Form';
import { ScrollArea } from '~/components/ui/ScrollArea';
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { useNewEvent } from '../store/newEventStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '~/utils/api';
import { useToast } from '~/components/ui/useToast';
import { useRouter } from 'next/router';
import { useCalendar } from '../../store';
import dayjs from 'dayjs';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '~/components/ui/Checkbox';
import { Input } from '~/components/ui/Input';

const reminders: { id: number; daysBefore: number }[] = [
  {
    id: 0,
    daysBefore: 1,
  },
  {
    id: 1,
    daysBefore: 2,
  },
  {
    id: 2,
    daysBefore: 3,
  },
];

export const step5Schema = z.object({
  reminders: z.array(
    z.object({ type: z.literal('discord'), daysBefore: z.number() })
  ),
});

export default function Step5() {
  const {
    setData,
    editMode,
    setStep,
    steps: {
      stepOne,
      stepTwoSingle,
      stepThreeSingle,
      stepFourSingle,
      stepFive,
    },
    setSheetOpened,
    reset,
    editModeEventId,
  } = useNewEvent();
  const selectDay = useCalendar(s => s.selectDay);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof step5Schema>>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      reminders: [],
    },
  });

  const utils = api.useContext();
  const createOrEditEvent = api.event.createOrEdit.useMutation({
    onError: err =>
      toast({
        variant: 'destructive',
        title: 'An error occured',
        description: err.message,
      }),
    onSuccess: async date => {
      await router.push(
        `/calendar?message=${editMode ? 'edited' : 'created'}Event`
      );
      await utils.event.invalidate();
      setSheetOpened(false);
      selectDay({ day: dayjs(date) });
      reset();
    },
  });

  async function onSubmit(values: z.infer<typeof step5Schema>) {
    setData({ step: '5', data: values });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = stepOne!.eventType!;
    await createOrEditEvent.mutateAsync({
      ...(eventType === 'single'
        ? {
            eventType,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stepTwo: stepTwoSingle!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stepThree: stepThreeSingle!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            stepFour: stepFourSingle!,
          }
        : { eventType }),
      eventId: editMode ? editModeEventId : undefined,
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Event reminders</SheetTitle>
        <SheetDescription>
          Enable or disable event notifications and customize them to your
          preference.
        </SheetDescription>
      </SheetHeader>
      <div className='grid justify-center gap-4 py-8 text-slate-50'>
        <ScrollArea className='max-h-[60vh]'>
          <Form {...form}>
            <form id='main-form' onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-2'>
                  <Image
                    src='/images/Discord.svg'
                    alt='Discord logo'
                    className='brightness-[10]'
                    width={22}
                    height={16}
                  />
                  <span className='font-semibold'>Discord</span>
                </div>
                <FormField
                  control={form.control}
                  name='reminders'
                  render={() => (
                    <FormItem>
                      <span className='text-slate-300'>
                        Remind me about the event:
                      </span>
                      {reminders.map(reminder => (
                        <FormField
                          key={reminder.id}
                          control={form.control}
                          name='reminders'
                          render={({ field }) => (
                            <FormItem
                              key={reminder.id}
                              className='flex w-[278px] items-center space-x-2 space-y-0'
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value.some(
                                    val =>
                                      val.daysBefore === reminder.daysBefore
                                  )}
                                  onCheckedChange={change =>
                                    change
                                      ? field.onChange([
                                          ...field.value,
                                          {
                                            type: 'discord',
                                            daysBefore: reminder.daysBefore,
                                          },
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            val =>
                                              val.daysBefore !==
                                              reminder.daysBefore
                                          )
                                        )
                                  }
                                />
                              </FormControl>
                              <FormLabel>
                                <span className='text-sm font-medium'>
                                  {reminder.daysBefore}
                                  {reminder.daysBefore > 1 ? ' days ' : ' day '}
                                  before
                                </span>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-between sm:justify-between'>
          <Button
            type='button'
            variant='secondary'
            onClick={() => {
              const data = form.getValues();
              setData({ step: '5', data });
              setStep('4-single');
            }}
            disabled={createOrEditEvent.isLoading}
          >
            Back
          </Button>
          <Button type='submit' disabled={createOrEditEvent.isLoading}>
            {createOrEditEvent.isLoading ? (
              <>
                Please wait
                <Loader2Icon className='ml-2 h-4 w-4 animate-spin' />
              </>
            ) : (
              `${editMode ? 'Edit' : 'Create'} event`
            )}
          </Button>
        </SheetFooter>
      </div>
    </>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { useEffect } from 'react';
import { digit8StrToDate } from '~/lib/dates';
import Step1, { stepOneSchema } from './Step1';
import MultiStepForm from '~/components/MultistepForm';

const newEventSchema = stepOneSchema;

export default function NewEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDateString = searchParams.get('d');

  useEffect(() => {
    if (!selectedDateString || selectedDateString.length !== 8)
      router.push('/calendar/');
  }, [router, selectedDateString]);

  const selectedDate = digit8StrToDate(selectedDateString!);

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

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import useMultistepForm from '~/hooks/useMultistepForm';
import Step from './Step';
import { useEffect } from 'react';
import { digit8StrToDate } from '~/lib/dates';

export default function NewEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDateString = searchParams.get('d');

  useEffect(() => {
    if (!selectedDateString || selectedDateString.length !== 8)
      router.push('/calendar/');
  }, [router, selectedDateString]);

  const selectedDate = digit8StrToDate(selectedDateString!);

  const { Form } = useMultistepForm({
    onSubmit: values => {
      console.log(values);
    },
    steps: [
      {
        schema: z.object({}),
        component: (
          <Step title="Step 1" description="Step 1 description">
            some content
            {selectedDate.format('YYYY/MM/DD')}
          </Step>
        ),
      },
    ],
  });

  return (
    <Sheet
      defaultOpen
      onOpenChange={open => {
        if (!open) router.push('/calendar');
      }}
    >
      <SheetContent>
        <Form />
      </SheetContent>
    </Sheet>
  );
}

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';

export const stepThreeSchema = z.object({
  // schema
});

export default function StepThree() {
  const form = useFormContext<z.infer<typeof stepThreeSchema>>();

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create an event</SheetTitle>
        <SheetDescription>
          Define the race week. Click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <div className='mx-auto flex w-4/5 flex-col gap-4 py-8 text-slate-50'>
        {/* INSERT CODE HERE */}
      </div>
    </>
  );
}

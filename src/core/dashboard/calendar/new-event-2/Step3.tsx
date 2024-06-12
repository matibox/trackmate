import { PlusIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { sessionTypes } from '~/lib/constants';
import SessionForm, { sessionSchema } from './SessionForm';

export const stepThreeSchema = z.object({
  sessions: z.array(sessionSchema),
});

export default function StepThree() {
  const [menuOpened, setMenuOpened] = useState(false);
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
        <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='secondary'
              className='justify-between'
              // disabled={loading}
            >
              New session
              <PlusIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-[268px]'>
            {sessionTypes.map(sessionType => (
              <SessionForm
                key={sessionType}
                sessionType={sessionType}
                onSubmit={values => {
                  console.log(values);
                  setMenuOpened(false);
                }}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

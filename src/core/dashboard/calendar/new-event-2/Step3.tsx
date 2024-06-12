import { PlusIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { sessionTypes } from '~/lib/constants';
import { capitalize } from '~/lib/utils';

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
        <DropdownMenu>
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
              <Dialog key={sessionType}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    {capitalize(sessionType)}
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className='text-slate-50'>
                  <DialogHeader>
                    <DialogTitle>Create {sessionType} session</DialogTitle>
                    <div className='flex w-full flex-col gap-4 text-slate-50'></div>
                  </DialogHeader>
                  <DialogFooter>
                    <Button>Submit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

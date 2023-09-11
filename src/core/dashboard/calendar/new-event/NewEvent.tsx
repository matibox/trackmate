import { Button } from '~/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/Sheet';
import {
  CalendarPlusIcon,
  FlagIcon,
  type LucideIcon,
  TrophyIcon,
} from 'lucide-react';
import { type ButtonHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

export default function NewEvent() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='fab'
          size='fab'
          className='absolute bottom-24 right-4'
          aria-label='Create event'
        >
          <CalendarPlusIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full border-0 ring-1 ring-slate-900'>
        <SheetHeader>
          <SheetTitle className='text-3xl'>Create event</SheetTitle>
          <SheetDescription>
            Select event type first, click next when you&apos;re ready.
          </SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-8'>
          <EventTypeButton
            icon={FlagIcon}
            title='Single event'
            label='Create a one-off event.'
          />
          <EventTypeButton
            icon={TrophyIcon}
            title='Championship event'
            label='Create an event associated with a championship.'
            disabled
          />
        </div>
        <SheetFooter>
          <Button type='submit' className='self-end'>
            Next
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface EventTypeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  title: string;
  label: string;
}

function EventTypeButton({
  icon,
  title,
  label,
  className,
  ...props
}: EventTypeButtonProps) {
  const Icon = icon;

  return (
    <button
      className={cn(
        'flex w-full select-none flex-col justify-end rounded-md bg-gradient-to-tr from-sky-700/25 via-slate-900/50 via-35% to-slate-900 bg-[length:200%_200%] bg-right-top p-6 no-underline outline-none ring-offset-slate-950 transition-[background-position] duration-500 hover:bg-left-bottom focus:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      <Icon className='h-6 w-6 text-slate-50' />
      <div className='mb-2 mt-4 text-lg font-medium text-slate-50'>{title}</div>
      <p className='text-left text-sm leading-tight text-slate-400'>{label}</p>
    </button>
  );
}

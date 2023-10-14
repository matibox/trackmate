import dayjs from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { generateDayGrid } from '~/lib/dates';

export default function Calendar() {
  const dayGrid = generateDayGrid(10 - 1, 2023);

  return (
    <section className='w-full max-w-lg rounded-md bg-slate-900 ring-1 ring-slate-800'>
      <header className='outline-b-1 flex w-full items-center justify-between border-b border-slate-800 px-4 py-2'>
        <Button aria-label='previous month' size='icon' variant='secondary'>
          <ChevronLeftIcon className='h-5 w-5' />
        </Button>
        <h1 className='text-xl'>October, 2023</h1>
        <Button aria-label='next month' size='icon' variant='secondary'>
          <ChevronRightIcon className='h-5 w-5' />
        </Button>
      </header>
      <div className='flex w-full flex-col gap-3 px-4 py-2'>
        <div className='flex gap-3'>
          {dayGrid[0]?.map((day, i) => (
            <span
              key={i}
              className='flex h-full w-full items-center justify-center text-sm font-medium text-slate-300'
            >
              {dayjs(day).format('dd')}
            </span>
          ))}
        </div>
        {dayGrid.map((row, i) => (
          <div key={i} className='flex h-[37px] gap-3'>
            {row.map((day, i) => (
              <Day key={i} day={day} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Day({ day }: { day: dayjs.Dayjs }) {
  return (
    <div className='bg-text-sm flex h-full w-full items-center justify-center rounded-md'>
      {day.date()}
    </div>
  );
}

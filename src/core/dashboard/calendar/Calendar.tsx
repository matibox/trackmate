import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '~/components/ui/Button';

export default function Calendar() {
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
      <div className='px-4 py-2'>days</div>
    </section>
  );
}

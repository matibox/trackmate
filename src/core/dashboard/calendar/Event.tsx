import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger } from '~/components/ui/Collapsible';
import { type RouterOutputs } from '~/utils/api';

export default function Event({
  session,
}: {
  session: RouterOutputs['event']['fromTo'][number];
}) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Collapsible
      open={isOpened}
      onOpenChange={setIsOpened}
      className='w-full rounded-md bg-slate-900 ring-1 ring-slate-800'
    >
      <CollapsibleTrigger className='flex w-full items-center gap-2.5 py-4 pl-2.5 pr-4'>
        <ChevronDown
          className='transition-[rotate]'
          style={{ rotate: isOpened ? '180deg' : '0deg' }}
        />
        <div className='flex flex-col items-start gap-0.5'>
          <span className='leading-none'>{session.event.name}</span>
          <span className='text-sm leading-none text-slate-300'>
            {session.event.track}
          </span>
        </div>
        <div className='ml-auto flex flex-col items-end gap-0.5'>
          <span className='leading-none'>Q 20:00</span>
          <span className='leading-none'>R 20:15</span>
        </div>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

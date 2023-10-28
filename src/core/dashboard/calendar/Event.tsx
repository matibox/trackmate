import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleTrigger } from '~/components/ui/Collapsible';
import { cn } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';

export default function Event({
  session,
}: {
  session: RouterOutputs['event']['fromTo'][number];
}) {
  const [isOpened, setIsOpened] = useState(false);

  const nextSessionIdx =
    session.event.sessions.length <= 2
      ? 0
      : session.event.sessions.findIndex(s => dayjs().isBefore(dayjs(s.start)));

  const sessionOverviews = session.event.sessions
    .filter(s => dayjs(s.start).date() === dayjs(session.start).date())
    .slice(nextSessionIdx);

  console.log(session.event.name, sessionOverviews);

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
          {sessionOverviews.map(session => (
            <SessionOverview
              key={`s-${session.id}`}
              session={session}
              length={sessionOverviews.length}
            />
          ))}
        </div>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

function SessionOverview({
  session: { start, end, type },
  length,
}: {
  session: RouterOutputs['event']['fromTo'][number]['event']['sessions'][number];
  length: number;
}) {
  const status = useMemo(() => {
    if (dayjs().isBetween(dayjs(start), dayjs(end))) return 'running';
    if (dayjs(start).isBefore(dayjs())) return 'finished';
    return 'upcoming';
  }, [end, start]);

  return (
    <span
      className={cn(
        {
          'text-xs text-slate-500': status === 'finished',
          'text-sm font-semibold text-sky-500': status === 'running',
          'text-sm text-slate-50': status === 'upcoming',
          'text-sm': length === 1,
        },
        'leading-none'
      )}
    >
      {type.charAt(0).toUpperCase()} {dayjs(start).format('HH:mm')}
    </span>
  );
}

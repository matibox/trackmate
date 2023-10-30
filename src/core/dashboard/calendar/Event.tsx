import dayjs from 'dayjs';
import { ChevronDown, MenuIcon } from 'lucide-react';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/Collapsible';
import { capitalize, cn } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';
import { useSessionStatus } from './useSessionStatus';

export default function Event({
  session,
}: {
  session: RouterOutputs['event']['fromTo'][number];
}) {
  const [isOpened, setIsOpened] = useState(false);

  const nextSessionIdx = useMemo(() => {
    return session.event.sessions.length <= 2
      ? 0
      : session.event.sessions.findIndex(s => dayjs().isBefore(dayjs(s.start)));
  }, [session.event.sessions]);

  const sessionOverviews = useMemo(() => {
    return session.event.sessions.filter(
      s => dayjs(s.start).date() === dayjs(session.start).date()
    );
  }, [session.event.sessions, session.start]);

  const [currentSessionId, setCurrentSessionId] = useState(
    sessionOverviews[0]?.id
  );

  return (
    <Collapsible
      open={isOpened}
      onOpenChange={setIsOpened}
      className='w-full rounded-md bg-slate-900 ring-1 ring-slate-800'
    >
      <div
        className='flex w-full items-center justify-between py-4 pl-2.5 pr-4'
        style={{
          borderBottom: isOpened ? '1px solid #1e293b' : ' ',
        }}
      >
        <CollapsibleTrigger className='flex grow items-center gap-2.5'>
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
        </CollapsibleTrigger>
        {!isOpened ? (
          <div className='flex flex-col items-end gap-0.5'>
            {sessionOverviews.slice(nextSessionIdx).map(session => (
              <SessionOverview
                key={`s-${session.id}`}
                session={session}
                length={sessionOverviews.length}
              />
            ))}
          </div>
        ) : (
          <Button
            variant='ghost'
            className='h-8 w-8 px-0'
            //!
            aria-label='open/close menu'
            disabled
          >
            <MenuIcon className='h-5 w-5' />
          </Button>
        )}
      </div>
      <CollapsibleContent className='CollapsibleContent'>
        <div className='flex h-full w-full flex-col gap-4 p-4'>
          <div className='flex w-full flex-col gap-2'>
            {sessionOverviews.map(session => {
              const sessionsOfType = sessionOverviews.filter(
                s => s.type === session.type
              );
              const sessionTypeNumber =
                sessionsOfType.length > 1
                  ? sessionsOfType.findIndex(s => s.id === session.id) + 1
                  : 0;

              return (
                <SessionDetails
                  key={session.id}
                  session={session}
                  currentSessionId={currentSessionId}
                  setCurrentSessionId={setCurrentSessionId}
                  sessionTypeNumber={sessionTypeNumber}
                />
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type Session =
  RouterOutputs['event']['fromTo'][number]['event']['sessions'][number];

function SessionOverview({
  session,
  length,
}: {
  session: Session;
  length: number;
}) {
  const status = useSessionStatus({ session });

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
      {session.type.charAt(0).toUpperCase()}{' '}
      {dayjs(session.start).format('HH:mm')}
    </span>
  );
}

function SessionDetails({
  session: { id, type, start, end },
  currentSessionId,
  setCurrentSessionId,
  sessionTypeNumber,
}: {
  session: Session;
  currentSessionId: string | undefined;
  setCurrentSessionId: Dispatch<SetStateAction<string | undefined>>;
  sessionTypeNumber: number;
}) {
  const isActive = currentSessionId === id;
  const status = useSessionStatus({ session: { start, end } });

  return (
    <div
      key={id}
      className={cn('flex w-full items-center justify-between', {
        'text-slate-300': status === 'finished',
        'text-sky-500': status === 'running',
        'text-slate-50': status === 'upcoming',
      })}
    >
      <Button
        variant='link'
        className={cn('h-auto p-0 font-normal leading-none text-inherit', {
          underline: isActive,
        })}
        onClick={() => setCurrentSessionId(id)}
      >
        {capitalize(type)} {sessionTypeNumber === 0 ? '' : sessionTypeNumber}
      </Button>
      <span className='text-sm leading-none'>
        {dayjs(start).format('HH:mm')} - {dayjs(end).format('HH:mm')}
      </span>
    </div>
  );
}

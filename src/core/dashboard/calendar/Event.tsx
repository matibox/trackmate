import dayjs from 'dayjs';
import {
  CarIcon,
  ChevronDown,
  ClockIcon,
  MapPinIcon,
  MenuIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/Collapsible';
import { capitalize, cn } from '~/lib/utils';
import { type RouterOutputs } from '~/utils/api';
import { useSessionStatus } from './useSessionStatus';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/Accordion';

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
          <Accordion
            type='single'
            collapsible
            defaultValue={sessionOverviews[0]?.id}
          >
            {sessionOverviews.map(sessionOverview => {
              const sessionsOfType = sessionOverviews.filter(
                s => s.type === sessionOverview.type
              );
              const sessionTypeNumber =
                sessionsOfType.length > 1
                  ? sessionsOfType.findIndex(s => s.id === sessionOverview.id) +
                    1
                  : 0;

              return (
                <SessionDetails
                  key={sessionOverview.id}
                  session={{ ...sessionOverview, event: session.event }}
                  sessionTypeNumber={sessionTypeNumber}
                />
              );
            })}
          </Accordion>
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

type SessionDetails = Session & {
  event: RouterOutputs['event']['fromTo'][number]['event'];
};

function SessionDetails({
  session: {
    id,
    type,
    start,
    end,
    drivers,
    event: { car, track },
  },
  sessionTypeNumber,
}: {
  session: SessionDetails;
  sessionTypeNumber: number;
}) {
  const status = useSessionStatus({ session: { start, end } });

  return (
    <AccordionItem
      key={id}
      value={id}
      className='border-slate-800 py-1 last:border-b-0 last:pb-0'
    >
      <AccordionTrigger className='group flex w-full items-center gap-2 py-0 hover:no-underline'>
        <span className='group-hover:underline'>
          {capitalize(type)} {sessionTypeNumber === 0 ? '' : sessionTypeNumber}
        </span>
        {status === 'running' || status === 'upcoming' ? (
          <div
            className={cn(
              'ml-1 flex items-center rounded-md px-2 py-1 text-xs font-semibold uppercase leading-none tracking-wide transition',
              {
                'bg-sky-700 text-slate-50': status === 'running',
                'bg-slate-800 text-slate-200': status === 'upcoming',
              }
            )}
          >
            {status === 'running' ? 'now' : 'next'}
          </div>
        ) : null}
        <span className='ml-auto text-sm font-normal leading-none'>
          {dayjs(start).format('HH:mm')} - {dayjs(end).format('HH:mm')}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className='flex flex-col gap-1 py-2'>
          <div className='flex items-center gap-1.5'>
            <ClockIcon className='h-[18px] w-[18px] text-slate-300' />
            <span className='leading-none'>
              {dayjs(start).format('HH:mm')} - {dayjs(end).format('HH:mm')}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <CarIcon className='h-[18px] w-[18px] text-slate-300' />
            <span className='leading-none'>{car}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <MapPinIcon className='h-[18px] w-[18px] text-slate-300' />
            <span className='leading-none'>{track}</span>
          </div>
          {drivers.length > 0 ? (
            <div className='flex items-center gap-1.5'>
              {drivers.length > 1 ? (
                <UsersIcon className='h-[18px] w-[18px] text-slate-300' />
              ) : (
                <UserIcon className='h-[18px] w-[18px] text-slate-300' />
              )}
              <span className='leading-none'>
                {drivers
                  .map(
                    d =>
                      `${d.firstName?.charAt(0).toUpperCase() ?? ''}.
                    ${d.lastName ?? ''}`
                  )
                  .join(', ')}
              </span>
            </div>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

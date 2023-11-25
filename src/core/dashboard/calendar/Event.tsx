import dayjs from 'dayjs';
import {
  CarIcon,
  ChevronDown,
  ClipboardCopyIcon,
  ClipboardSignatureIcon,
  ClockIcon,
  CloudIcon,
  CloudRainWindIcon,
  KeyRoundIcon,
  MapPinIcon,
  ShuffleIcon,
  ThermometerIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar';
import { useCalendar } from './store';
import { ScrollArea } from '~/components/ui/ScrollArea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/Tooltip';
import { useCopyToast } from '~/hooks/useCopyToast';
import EventDropdown from './EventDropdown';

export default function Event({
  session,
}: {
  session: RouterOutputs['event']['fromTo'][number];
}) {
  const [isOpened, setIsOpened] = useState(false);
  const currentDay = useCalendar(s => s.currentDay);

  const nextSessionIdx = useMemo(() => {
    const sessions = session.event.sessions;
    if (sessions.length <= 2) return 0;
    const idx = sessions.findIndex(s => dayjs().isBefore(dayjs(s.start)));
    if (idx <= 2) return 0;
    return idx;
  }, [session.event.sessions]);

  const sessionOverviews = useMemo(() => {
    return session.event.sessions.filter(
      s => dayjs(s.start).date() === dayjs(session.start).date()
    );
  }, [session.event.sessions, session.start]);

  const defaultExpandedSessionId = useMemo(
    () =>
      sessionOverviews.find(s =>
        dayjs().isBetween(dayjs(s.start), dayjs(s.end))
      )?.id ?? sessionOverviews[0]?.id,
    [sessionOverviews]
  );

  return (
    <>
      {/* < 2xl: */}
      <Collapsible
        open={isOpened}
        onOpenChange={setIsOpened}
        className='w-full rounded-md border border-slate-800 bg-slate-900 2xl:hidden'
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
              {sessionOverviews
                .slice(nextSessionIdx, nextSessionIdx + 2)
                .map(session => (
                  <SessionOverview
                    key={`s-${session.id}`}
                    session={session}
                    length={sessionOverviews.length}
                  />
                ))}
            </div>
          ) : (
            <EventDropdown eventId={session.event.id} />
          )}
        </div>
        <CollapsibleContent className='CollapsibleContent'>
          <div className='flex h-full w-full flex-col gap-4 p-4'>
            <Accordion
              type='single'
              collapsible
              defaultValue={defaultExpandedSessionId}
            >
              {sessionOverviews.map(sessionOverview => {
                const sessionsOfType = sessionOverviews.filter(
                  s => s.type === sessionOverview.type
                );
                const sessionTypeNumber =
                  sessionsOfType.length > 1
                    ? sessionsOfType.findIndex(
                        s => s.id === sessionOverview.id
                      ) + 1
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
      {/* 2xl: */}
      <ScrollArea className='hidden 2xl:flex 2xl:h-full 2xl:w-[320px] 2xl:flex-col 2xl:gap-4 2xl:rounded-md 2xl:bg-slate-900 2xl:p-4 2xl:ring-1 2xl:ring-slate-800'>
        <div className='flex w-full items-center'>
          <div
            className={cn(
              'flex flex-col items-center font-bold transition-colors',
              {
                'text-sky-500':
                  currentDay.format('DDMMYYYY') ===
                  dayjs(session.start).format('DDMMYYYY'),
              }
            )}
          >
            <span className='text-xl leading-none'>
              {dayjs(session.start).format('ddd')}
            </span>
            <span className='text-4xl leading-none'>
              {dayjs(session.start).format('DD')}
            </span>
          </div>
          <div className='mx-4 h-12 w-px bg-slate-800' />
          <div className='flex flex-col'>
            <span className='leading-none'>
              {capitalize(session.event.name)}
            </span>
            <span className='text-sm leading-none text-slate-300'>
              {session.event.track}
            </span>
          </div>
          <EventDropdown className='ml-auto' eventId={session.event.id} />
        </div>
        <div>
          <Accordion
            type='single'
            collapsible
            defaultValue={defaultExpandedSessionId}
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
      </ScrollArea>
    </>
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
    inGameTime,
    serverName,
    serverPassword,
    cloudLevel,
    rainLevel,
    randomness,
    temperature,
    event: { car, track, sessions },
  },
  sessionTypeNumber,
}: {
  session: SessionDetails;
  sessionTypeNumber: number;
}) {
  const status = useMemo(() => {
    if (dayjs().isBetween(dayjs(start), dayjs(end))) return 'running';
    const nextSession = sessions.find(s => dayjs(s.start).isAfter(dayjs()));
    if (!nextSession) return 'finished';
    return nextSession.id === id ? 'next' : 'finished';
  }, [end, start, sessions, id]);

  const { copyWithToast } = useCopyToast();

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
        {status === 'running' || status === 'next' ? (
          <div
            className={cn(
              'ml-1 flex items-center rounded-md px-2 py-1 text-xs font-semibold uppercase leading-none tracking-wide transition',
              {
                'bg-sky-700 text-slate-50': status === 'running',
                'bg-slate-800 text-slate-200': status === 'next',
              }
            )}
          >
            {status === 'running' ? 'now' : 'next'}
          </div>
        ) : null}
        <span className='ml-auto text-sm font-normal leading-none'>
          {dayjs(start).format('HH:mm')}
          {end ? ` - ${dayjs(end).format('HH:mm')}` : ''}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className='flex flex-col gap-1 py-2'>
          <div className='flex items-center gap-1.5'>
            <ClockIcon className='h-[18px] w-[18px] text-slate-300' />
            <span className='leading-none'>
              {dayjs(start).format('HH:mm')}
              {end ? ` - ${dayjs(end).format('HH:mm')}` : ''}
            </span>
          </div>
          {type !== 'briefing' ? (
            <>
              <div className='flex items-center gap-1.5'>
                <CarIcon className='h-[18px] w-[18px] text-slate-300' />
                <span className='leading-none'>{car}</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <MapPinIcon className='h-[18px] w-[18px] text-slate-300' />
                <span className='leading-none'>{track}</span>
              </div>
              {inGameTime || serverName || serverPassword ? (
                <Collapsible className='my-1 first:mt-0.5 last:mb-0.5'>
                  <div className='flex items-center gap-2'>
                    <CollapsibleTrigger className='group flex items-center gap-2 [&[data-state=open]>svg]:rotate-180'>
                      <ChevronDown className='h-4 w-4 transition-transform duration-200' />
                      <span className='text-sm font-medium'>
                        Server information
                      </span>
                    </CollapsibleTrigger>
                    {serverName ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='outline'
                              className='ml-auto h-auto p-1.5'
                              onClick={() =>
                                copyWithToast({ valueToCopy: serverName })
                              }
                            >
                              <ClipboardCopyIcon className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy server name</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                    {serverPassword ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='outline'
                              className='h-auto p-1.5'
                              onClick={() =>
                                window.navigator.clipboard.writeText(
                                  serverPassword
                                )
                              }
                            >
                              <KeyRoundIcon className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy server password</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </div>
                  <CollapsibleContent className='mt-1 flex flex-col gap-5'>
                    <>
                      <div className='flex flex-col gap-1.5'>
                        {inGameTime ? (
                          <div className='flex items-center gap-1.5'>
                            <ClockIcon className='h-[18px] w-[18px] text-slate-300' />
                            <span className='leading-none'>
                              {dayjs(inGameTime).format('HH:mm')}
                            </span>
                          </div>
                        ) : null}
                        {serverName ? (
                          <div className='flex items-center gap-1.5'>
                            <ClipboardSignatureIcon className='h-[18px] w-[18px] text-slate-300' />
                            <span className='leading-none'>{serverName}</span>
                          </div>
                        ) : null}
                        {serverPassword ? (
                          <div className='flex items-center gap-1.5'>
                            <KeyRoundIcon className='h-[18px] w-[18px] text-slate-300' />
                            <span className='leading-none'>
                              {serverPassword}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </>
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </>
          ) : null}
          {type === 'qualifying' || type === 'race' ? (
            <>
              {cloudLevel || rainLevel || temperature || randomness ? (
                <Collapsible className='my-1 first:mt-0.5 last:mb-0.5'>
                  <CollapsibleTrigger className='group flex items-center gap-2 [&[data-state=open]>svg]:rotate-180'>
                    <ChevronDown className='h-4 w-4 transition-transform duration-200' />
                    <span className='text-sm font-medium'>
                      Weather information
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='mt-1 flex flex-col gap-5'>
                    <>
                      <div className='flex flex-col gap-1.5'>
                        {cloudLevel ? (
                          <div className='flex items-center gap-1.5'>
                            <CloudIcon className='h-[18px] w-[18px] text-slate-300' />
                            <span className='leading-none'>
                              Clouds: {cloudLevel.toString()}
                            </span>
                          </div>
                        ) : null}
                        {rainLevel ? (
                          <div className='flex items-center gap-1.5'>
                            <CloudRainWindIcon className='h-[18px] w-[18px] text-slate-300' />
                            <span className='leading-none'>
                              Rain: {rainLevel.toString()}
                            </span>
                          </div>
                        ) : null}
                        {temperature ? (
                          <div className='flex items-center gap-1.5'>
                            <ThermometerIcon className='h-[18px] w-[18px] text-slate-300' />
                            <span className='leading-none'>
                              {temperature}°C
                            </span>
                          </div>
                        ) : null}
                        {randomness ? (
                          <div className='flex items-center gap-1.5'>
                            <ShuffleIcon className='h-[18px] w-[18px] text-slate-300' />
                            Randomness:{' '}
                            <span className='leading-none'>{randomness}</span>
                          </div>
                        ) : null}
                      </div>
                    </>
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
            </>
          ) : null}
          {/* < 2xl drivers */}
          {drivers.length > 0 ? (
            <>
              <div className='2xl:hidden'>
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
              </div>
              {/* 2xl drivers */}
              <div className='hidden 2xl:mt-1 2xl:flex 2xl:items-center 2xl:gap-1.5'>
                <span className='text-sm font-medium'>Drivers</span>
              </div>
              <div className='hidden 2xl:flex 2xl:flex-wrap 2xl:gap-2'>
                {drivers.map(d => (
                  <div
                    key={d.id}
                    className='flex basis-[calc(50%_-_0.5rem)] flex-col items-center gap-2 rounded-md border border-slate-800 bg-gradient-to-tr from-sky-900/20 to-slate-800/30 px-4 py-2'
                  >
                    <Avatar>
                      <AvatarImage
                        src={d.image ?? ''}
                        alt={`@${d.username ?? ''}`}
                      />
                      <AvatarFallback>
                        {d.firstName?.charAt(0).toUpperCase()}
                        {d.lastName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant='link' className='h-auto w-auto p-0'>
                      {d.firstName?.charAt(0).toUpperCase()}. {d.lastName}
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

import { MenuIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { sessionTypes } from '~/lib/constants';
import SessionForm, { sessionSchema } from './SessionForm';
import crypto from 'crypto';
import { FormField, FormMessage } from '~/components/ui/Form';
import { capitalize, formatSessionDate, timeStringToDate } from '~/lib/utils';
import dayjs from 'dayjs';
import { Separator } from '~/components/ui/Separator';
import { ScrollArea } from '~/components/ui/ScrollArea';

export const stepThreeSchema = z.object({
  sessions: z
    .array(sessionSchema.and(z.object({ id: z.string() })))
    .min(1, 'At least 1 session is required.'),
});

const mockSessions: z.infer<typeof stepThreeSchema>['sessions'] = [
  {
    id: '0',
    type: 'briefing',
    date: dayjs('2024-06-24').toDate(),
    startTime: '15:00',
  },
  {
    id: '1',
    type: 'practice',
    date: dayjs('2024-06-24').toDate(),
    startTime: '15:30',
    endTime: '16:30',
    inGameTime: '15:30',
  },
  {
    id: '2',
    type: 'qualifying',
    date: dayjs('2024-06-24').toDate(),
    startTime: '16:30',
    endTime: '17:00',
    driverId: 'clwwn17ja0000tlci7yxs1299',
    includeWeather: false,
    inGameTime: '16:30',
    serverName: 'quali',
    serverPassword: 'quali',
  },
  {
    id: '3',
    type: 'race',
    date: dayjs('2024-06-25').toDate(),
    startTime: '15:00',
    endTime: '16:00',
    driverIds: ['clwwn17ja0000tlci7yxs1299'],
    includeWeather: true,
    endsNextDay: false,
    cloudLevel: '1',
    rainLevel: '1',
    randomness: '2',
    temperature: '17',
  },
  {
    id: '4',
    type: 'race',
    date: dayjs('2024-06-25').toDate(),
    startTime: '16:00',
    endTime: '16:00',
    driverIds: ['clwwn17ja0000tlci7yxs1299'],
    includeWeather: false,
    endsNextDay: true,
    inGameTime: '16:00',
    serverName: 'race',
    serverPassword: 'race',
  },
  {
    id: '5',
    type: 'race',
    date: dayjs('2024-06-30').toDate(),
    startTime: '16:00',
    endTime: '16:00',
    driverIds: ['clwwn17ja0000tlci7yxs1299'],
    includeWeather: true,
    endsNextDay: true,
    inGameTime: '16:00',
    serverName: 'race',
    serverPassword: 'race',
    rainLevel: '1',
    cloudLevel: '1',
    randomness: '2',
    temperature: '17',
  },
];

export default function StepThree() {
  const [menuOpened, setMenuOpened] = useState(false);
  const form = useFormContext<z.infer<typeof stepThreeSchema>>();

  const sessions = form.watch('sessions');
  const sortedSessions = useMemo(() => {
    return sessions.sort((a, b) => {
      const startDateA = timeStringToDate(a.startTime, dayjs(a.date));
      const startDateB = timeStringToDate(b.startTime, dayjs(b.date));

      if (startDateA.isBefore(startDateB)) return -1;
      if (startDateA.isAfter(startDateB)) return -1;
      return 0;
    });
  }, [sessions]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create an event</SheetTitle>
        <SheetDescription>
          Define the race week. Click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <div className='mx-auto flex w-4/5 flex-col gap-4 py-8 text-slate-50'>
        <FormField
          control={form.control}
          name='sessions'
          render={() => (
            <>
              <ScrollArea>
                <div className='flex max-h-[60vh] flex-col gap-4'>
                  {mockSessions.map(session => {
                    const hasServerSettings =
                      'inGameTime' in session ||
                      'serverName' in session ||
                      'serverPassword' in session;

                    return (
                      <div
                        key={session.id}
                        className='flex w-full flex-col justify-between gap-3 rounded-md border border-slate-800 px-3.5 py-3'
                      >
                        <div className='flex justify-between'>
                          <div className='flex flex-col gap-1.5'>
                            <span className='font-medium leading-none'>
                              {capitalize(session.type)}
                            </span>
                            <span className='text-sm leading-none text-slate-400'>
                              {formatSessionDate(
                                session.date,
                                'endsNextDay' in session && session.endsNextDay
                              )}
                            </span>
                            <span className='text-sm leading-none text-slate-400'>
                              {session.startTime}{' '}
                              {'endTime' in session && ` - ${session.endTime}`}
                            </span>
                          </div>
                          <div>
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  className='h-8 w-8 px-0'
                                  aria-label='toggle menu'
                                >
                                  <MenuIcon className='h-5 w-5' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='w-56'>
                                <DropdownMenuLabel>
                                  Session actions
                                </DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      console.log('edit session');
                                    }}
                                  >
                                    <PencilIcon className='mr-2 h-4 w-4' />
                                    <span>Edit session</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const prev = form.getValues('sessions');
                                      form.setValue(
                                        'sessions',
                                        prev.filter(s => s.id !== session.id)
                                      );
                                    }}
                                    className='text-red-500 focus:text-red-500'
                                  >
                                    <Trash2Icon className='mr-2 h-4 w-4' />
                                    <span>Delete session</span>
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {hasServerSettings && (
                          <>
                            <Separator />
                            <div className='flex flex-col gap-1.5 text-sm leading-none text-slate-400'>
                              {'inGameTime' in session && (
                                <span>In-game: {session.inGameTime}</span>
                              )}
                              {'serverName' in session && (
                                <span>Server name: {session.serverName}</span>
                              )}
                              {'serverPassword' in session && (
                                <span>
                                  Server password: {session.serverPassword}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                        {'includeWeather' in session &&
                          session.includeWeather && (
                            <>
                              <Separator />
                              <div className='flex flex-col gap-1.5 text-sm leading-none text-slate-400'>
                                <span>Rain level: {session.rainLevel}</span>
                                <span>Cloud level: {session.cloudLevel}</span>
                                <span>Randomness: {session.randomness}</span>
                                <span>
                                  Temperature: {session.temperature}°C
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <FormMessage />
            </>
          )}
        />
        <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary' className='justify-between'>
              New session
              <PlusIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-[268px]'>
            {sessionTypes.map(sessionType => (
              <SessionForm
                key={sessionType}
                sessionType={sessionType}
                onSubmit={newSession => {
                  console.log('inner', newSession);

                  const currentSessions = form.getValues('sessions');
                  form.setValue('sessions', [
                    ...currentSessions,
                    {
                      id: crypto.randomBytes(8).toString('hex'),
                      ...newSession,
                    },
                  ]);

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

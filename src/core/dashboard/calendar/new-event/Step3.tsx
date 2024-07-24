import { MenuIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type UseFormReturn, useFormContext } from 'react-hook-form';
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
import { FormField, FormMessage } from '~/components/ui/Form';
import {
  capitalize,
  formatSessionDate,
  genId,
  timeStringToDate,
} from '~/lib/utils';
import dayjs from 'dayjs';
import { Separator } from '~/components/ui/Separator';
import { ScrollArea } from '~/components/ui/ScrollArea';

export const stepThreeValues = {
  sessions: z
    .array(sessionSchema.and(z.object({ id: z.string() })))
    .min(1, 'At least 1 session is required.'),
};

export const stepThreeSchema = z.object(stepThreeValues);

function useSessions(form: UseFormReturn<z.infer<typeof stepThreeSchema>>) {
  const sessions = form.watch('sessions');
  const sortedSessions = useMemo(() => {
    return sessions.sort((a, b) => {
      const startDateA = timeStringToDate(a.startTime, dayjs(a.date));
      const startDateB = timeStringToDate(b.startTime, dayjs(b.date));

      if (startDateA.isBefore(startDateB)) return -1;
      if (startDateA.isAfter(startDateB)) return 1;
      return 0;
    });
  }, [sessions]);

  function addSession(newSession: z.infer<typeof sessionSchema>) {
    const currentSessions = form.getValues('sessions');
    form.setValue('sessions', [
      ...currentSessions,
      {
        id: genId(),
        ...newSession,
      },
    ]);
  }

  function removeSession(id: string) {
    const currentSessions = form.getValues('sessions');
    form.setValue(
      'sessions',
      currentSessions.filter(s => s.id !== id)
    );
  }

  function editSession(id: string, values: z.infer<typeof sessionSchema>) {
    const currentSessions = form.getValues('sessions');
    form.setValue(
      'sessions',
      currentSessions.map(s => (s.id === id ? { ...s, ...values } : s))
    );
  }

  return { sortedSessions, addSession, removeSession, editSession };
}

export default function StepThree({
  edit: editMode = false,
}: {
  edit?: boolean;
}) {
  const [newSessionMenuOpened, setNewSessionMenuOpened] = useState(false);
  const form = useFormContext<z.infer<typeof stepThreeSchema>>();

  const {
    sortedSessions: sessions,
    addSession,
    editSession,
    removeSession,
  } = useSessions(form);

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>
          {editMode ? 'Edit' : 'Create'} an event
        </SheetTitle>
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
                  {sessions.map(session => {
                    const hasInGameTime =
                      'inGameTime' in session && session.inGameTime;
                    const hasServerPass =
                      'serverPassword' in session && session.serverPassword;
                    const hasServerName =
                      'serverName' in session && session.serverName;

                    const hasServerSettings =
                      hasInGameTime || hasServerName || hasServerPass;

                    return (
                      <div
                        key={session.id}
                        className='flex w-full flex-col justify-between gap-3 rounded-md border border-slate-800 bg-slate-900 px-3.5 py-3'
                      >
                        <div className='flex justify-between'>
                          <div className='flex flex-col gap-1.5'>
                            <span className='font-medium leading-none'>
                              {capitalize(session.type)}
                            </span>
                            <span className='text-sm leading-none text-slate-300'>
                              {formatSessionDate(
                                session.date,
                                'endsNextDay' in session && session.endsNextDay
                              )}
                            </span>
                            <span className='text-sm leading-none text-slate-300'>
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
                                  <SessionForm
                                    sessionType={session.type}
                                    defaultValues={session}
                                    title={`Edit ${session.type} session`}
                                    trigger={
                                      <DropdownMenuItem
                                        onSelect={e => e.preventDefault()}
                                      >
                                        <PencilIcon className='mr-2 h-4 w-4' />
                                        <span>Edit session</span>
                                      </DropdownMenuItem>
                                    }
                                    onSubmit={values => {
                                      editSession(session.id, values);
                                    }}
                                  />
                                  <DropdownMenuItem
                                    onClick={() => removeSession(session.id)}
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
                              {hasInGameTime && (
                                <span>In-game: {session.inGameTime}</span>
                              )}
                              {hasServerName && (
                                <span>Server name: {session.serverName}</span>
                              )}
                              {hasServerPass && (
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
        <DropdownMenu
          open={newSessionMenuOpened}
          onOpenChange={setNewSessionMenuOpened}
        >
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
                title={`Create ${sessionType} session`}
                trigger={
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    {capitalize(sessionType)}
                  </DropdownMenuItem>
                }
                onSubmit={newSession => {
                  addSession(newSession);
                  setNewSessionMenuOpened(false);
                }}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

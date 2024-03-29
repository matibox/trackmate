import { api } from '~/utils/api';
import { useCalendar } from './store';
import dayjs from 'dayjs';
import { cn, groupBy } from '~/lib/utils';
import { addOrdinal } from '~/lib/dates';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '~/components/ui/useToast';
import { type RefObject, useEffect } from 'react';
import Event from './Event';
import { Button } from '~/components/ui/Button';
import { useNewEvent } from './new-event/store/newEventStore';
import { useDragScroll } from './useDragScroll';

export default function EventList() {
  const currentDay = useCalendar(s => s.currentDay);
  const setNewEventFormOpened = useNewEvent(s => s.setSheetOpened);

  const {
    data: sessions,
    status,
    error,
  } = api.event.fromTo.useQuery({
    from: currentDay.startOf('week').toDate(),
    to: currentDay.endOf('week').toDate(),
  });

  const { toast } = useToast();

  useEffect(() => {
    if (status !== 'error') return;
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: error.message,
    });
  }, [error?.message, status, toast]);

  function scrollEventList({
    ref,
    offset,
    smooth = false,
  }: {
    ref: RefObject<HTMLElement>;
    offset: number;
    smooth?: boolean;
  }) {
    if (ref.current?.scrollLeft === undefined) return;
    ref.current.style.scrollBehavior = smooth ? 'smooth' : 'auto';
    ref.current.scrollLeft += offset;
  }

  const dragScroll = useDragScroll({ smooth: true });

  if (status === 'success') {
    const sessionsByDay = groupBy(
      sessions,
      s => s.start.toISOString().split('T')[0] as string
    );

    return (
      <section
        className='flex flex-col gap-8 md:col-start-2 md:row-span-3 md:row-start-1 lg:row-start-2 2xl:relative 2xl:row-start-2 2xl:row-end-4 2xl:max-w-full 2xl:select-none 2xl:flex-row 2xl:overflow-x-scroll 2xl:py-px 2xl:scrollbar-none'
        {...dragScroll}
      >
        {sessions.length > 0 ? (
          <div className='hidden 2xl:sticky 2xl:left-0 2xl:top-0 2xl:z-10 2xl:-mr-8 2xl:flex 2xl:h-full 2xl:min-w-[64px] 2xl:items-center 2xl:justify-center 2xl:bg-gradient-to-r 2xl:from-slate-950'>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
              aria-label='Scroll left'
              onClick={() =>
                scrollEventList({
                  ref: dragScroll.ref,
                  offset: -320,
                  smooth: true,
                })
              }
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>
          </div>
        ) : null}
        {sessions.length > 0 ? (
          Object.entries(sessionsByDay).map(([day, data]) => {
            const isSelected = dayjs(day).isSame(currentDay);
            const formattedDay = `${dayjs(day).format('dddd')}, ${addOrdinal(
              dayjs(day).date()
            )}`;

            const uniqueSessionsByEventIdAndDate = [
              ...new Map(
                data.map(s => [`${s.event.id}${day}`, { ...s }])
              ).values(),
            ];

            return (
              <div
                key={day}
                className='flex flex-col gap-3 2xl:flex-row 2xl:gap-0'
              >
                <div
                  className={cn('flex items-center text-xl transition-colors', {
                    'text-sky-500': isSelected,
                  })}
                >
                  {dayjs(day).date() === dayjs().date() ? (
                    <div
                      className={cn(
                        'mr-2 flex items-center rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold uppercase leading-none tracking-wide text-slate-200 transition 2xl:hidden',
                        {
                          'bg-sky-700 text-slate-50': isSelected,
                        }
                      )}
                    >
                      today
                    </div>
                  ) : null}
                  <span className='leading-none 2xl:hidden'>
                    {formattedDay}
                  </span>
                </div>
                <div className='flex flex-col gap-4 2xl:flex-row 2xl:gap-8'>
                  {uniqueSessionsByEventIdAndDate.map(session => (
                    <Event key={session.id} session={session} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className='text-center text-slate-300 lg:my-auto 2xl:absolute 2xl:left-1/2 2xl:top-1/2 2xl:-translate-x-1/2 2xl:-translate-y-1/2'>
            <div className='flex flex-col items-center gap-1'>
              <span>There are no scheduled events for this week.</span>
              <Button
                variant='ghost'
                onClick={() => setNewEventFormOpened(true)}
              >
                Create a new event
              </Button>
            </div>
          </div>
        )}
        {sessions.length > 0 ? (
          <div className='hidden 2xl:sticky 2xl:right-0 2xl:top-0 2xl:z-10 2xl:ml-auto 2xl:flex 2xl:h-full 2xl:min-w-[64px] 2xl:items-center 2xl:justify-center 2xl:bg-gradient-to-l 2xl:from-slate-950'>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
              aria-label='Scroll right'
              onClick={() =>
                scrollEventList({
                  ref: dragScroll.ref,
                  offset: 320,
                  smooth: true,
                })
              }
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className='flex flex-col items-center md:col-start-2 md:row-span-2 md:row-start-1 md:my-auto lg:row-start-2'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className='flex flex-col items-center md:col-start-2 md:row-span-2 md:row-start-1 md:my-auto lg:row-start-2'>
        <p className='text-slate-300'>
          An error occured, try refreshing the page.
        </p>
      </section>
    );
  }

  return null;
}

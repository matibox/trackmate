import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { Toaster } from '~/components/ui/Toaster';
import Profile from '~/core/dashboard/calendar/Profile';
import NewEvent from '~/core/dashboard/calendar/new-event/NewEvent';
import { useProtectedRoute } from '~/hooks/useProtectedRoute';
import { getServerAuthSession } from '~/server/auth';
import CalendarComp from '~/core/dashboard/calendar/Calendar';
import EventList from '~/core/dashboard/calendar/EventList';
import { Button } from '~/components/ui/Button';
import { useNewEvent } from '~/core/dashboard/calendar/new-event/newEventStore';
import DashboardLayout from '~/core/dashboard/Layout';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  return {
    props: { session },
  };
}

const Calendar: NextPage = () => {
  useProtectedRoute();

  const setNewEventFormOpened = useNewEvent(s => s.setSheetOpened);

  return (
    <>
      <NextSeo title='Calendar' />
      <div className='relative min-h-screen'>
        <Toaster />
        <DashboardLayout>
          <div className='grid grid-cols-[min(100%,_370px)] justify-center gap-4 md:grid-cols-[370px,_1fr] md:justify-normal lg:grid-cols-[420px,_1fr] lg:gap-x-8 xl:gap-x-16 2xl:grid-rows-[1fr,_3.5rem,_473px] 2xl:gap-x-0'>
            <div className='hidden lg:col-span-2 lg:mb-8 lg:flex lg:items-center lg:justify-between lg:pr-12'>
              <div className='flex flex-col gap-2'>
                <h1 className='text-5xl font-bold leading-none'>Calendar</h1>
                <span className='leading-none text-slate-300'>
                  Schedule your races and see their details.
                </span>
              </div>
              <Button
                variant='primary'
                onClick={() => setNewEventFormOpened(true)}
              >
                New event
              </Button>
            </div>
            <Profile />
            <CalendarComp />
            <EventList />
          </div>
          <NewEvent />
        </DashboardLayout>
      </div>
    </>
  );
};

export default Calendar;

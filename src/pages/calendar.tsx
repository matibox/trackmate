import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Toaster } from '~/components/ui/Toaster';
import { useToast } from '~/components/ui/useToast';
import Profile from '~/core/dashboard/calendar/Profile';
import NewEvent from '~/core/dashboard/calendar/new-event/components/NewEvent';
import DashboardLayout from '~/core/dashboard/components/Layout';
import { useProtectedRoute } from '~/hooks/useProtectedRoute';
import { getServerAuthSession } from '~/server/auth';
import CalendarComp from '~/core/dashboard/calendar/Calendar';
import EventList from '~/core/dashboard/calendar/EventList';
import { Button } from '~/components/ui/Button';
import { useNewEvent } from '~/core/dashboard/calendar/new-event/store/newEventStore';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  return {
    props: { session },
  };
}

const Calendar: NextPage = () => {
  const router = useRouter();
  const { message: toastMessage } = router.query as {
    message?: 'welcome' | 'createdEvent' | undefined;
  };
  const { toast } = useToast();

  useEffect(() => {
    if (!toastMessage) return;
    switch (toastMessage) {
      case 'welcome':
        toast({
          variant: 'default',
          title: 'Signup successful.',
          description: `Welcome on board! Thanks for joining TrackMate!`,
        });
        break;
      case 'createdEvent':
        toast({
          variant: 'default',
          title: 'Success!',
          description: 'An event has successfully been created.',
        });
        break;
    }

    const timeout = setTimeout(() => {
      void router.push('/calendar', undefined, { shallow: true });
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [toast, router, toastMessage]);

  const setNewEventFormOpened = useNewEvent(s => s.setSheetOpened);

  useProtectedRoute();

  return (
    <>
      <NextSeo title='Calendar' />
      <div className='relative min-h-screen'>
        <Toaster />
        <DashboardLayout>
          <div className='grid grid-cols-[min(100%,_370px)] justify-center gap-4 md:grid-cols-[370px,_1fr] md:justify-normal lg:grid-cols-[420px,_1fr] lg:gap-x-8 xl:gap-x-16 2xl:grid-rows-[1fr,_3.5rem,_473px]'>
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

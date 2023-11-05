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

  useProtectedRoute();

  return (
    <>
      <NextSeo title='Calendar' />
      <div className='relative min-h-screen'>
        <Toaster />
        <DashboardLayout>
          <div className='grid grid-cols-[min(100%,_370px)] gap-4 md:grid-cols-2'>
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

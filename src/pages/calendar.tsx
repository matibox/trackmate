import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Toaster } from '~/components/ui/Toaster';
import { useToast } from '~/components/ui/useToast';
import NewEvent from '~/core/dashboard/calendar/new-event/components/NewEvent';
import DashboardLayout from '~/core/dashboard/components/Layout';
import { getServerAuthSession } from '~/server/auth';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (!session.user.active) {
    return {
      redirect: {
        destination: '/welcome',
        permanent: false,
      },
    };
  }

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

  return (
    <>
      <NextSeo title='Calendar' />
      <div className='relative h-screen'>
        <Toaster />
        <DashboardLayout>
          <NewEvent />
        </DashboardLayout>
      </div>
    </>
  );
};

export default Calendar;

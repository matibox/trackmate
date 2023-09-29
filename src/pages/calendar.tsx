import { type GetServerSidePropsContext, type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar';

import { Toaster } from '~/components/ui/Toaster';
import { useToast } from '~/components/ui/useToast';
import NewEvent from '~/core/dashboard/calendar/new-event/components/NewEvent';
import DashboardLayout from '~/core/dashboard/components/Layout';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/utils/api';

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

  const { data: session } = useSession();

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

  const eventsQuery = api.event.get.useQuery();

  return (
    <>
      <NextSeo title='Calendar' />
      <div className='relative h-screen'>
        <Toaster />
        <DashboardLayout>
          {/* profile component */}
          <div className='flex w-full max-w-lg items-center justify-between rounded-md bg-slate-900 px-4 py-2 ring-1 ring-slate-800'>
            <div>
              <Avatar>
                <AvatarImage
                  src={session?.user.image ?? ''}
                  alt={`@${session?.user.username ?? ''}`}
                />
                <AvatarFallback>
                  {session?.user.firstName?.charAt(0).toUpperCase()}
                  {session?.user.lastName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          temporary event name list:
          {eventsQuery.data?.map(event => (
            <div key={event.id}>{event.name}</div>
          ))}
          <NewEvent />
        </DashboardLayout>
      </div>
    </>
  );
};

export default Calendar;

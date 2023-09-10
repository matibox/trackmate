import { CalendarPlusIcon, FlagIcon, TrophyIcon } from 'lucide-react';
import { type GetServerSidePropsContext, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/Sheet';
import { Toaster } from '~/components/ui/Toaster';
import { useToast } from '~/components/ui/useToast';
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
  const { welcome } = router.query as { welcome?: 'true' | undefined };
  const { toast } = useToast();

  useEffect(() => {
    if (!welcome) return;
    toast({
      variant: 'default',
      title: 'Signup successful.',
      description: `Welcome on board! Thanks for joining TrackMate!`,
    });

    const timeout = setTimeout(() => {
      void router.push('/calendar', undefined, { shallow: true });
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [welcome, toast, router]);

  return (
    <>
      <NextSeo title='Calendar' />
      <div className='relative h-screen'>
        <Toaster />
        <DashboardLayout>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='fab'
                size='fab'
                className='absolute bottom-24 right-4'
                aria-label='Create event'
              >
                <CalendarPlusIcon />
              </Button>
            </SheetTrigger>
            <SheetContent className='w-full border-0 ring-1 ring-slate-900'>
              <SheetHeader>
                <SheetTitle className='text-3xl'>Create event</SheetTitle>
                <SheetDescription>
                  Select event type first, click next when you&apos;re ready.
                </SheetDescription>
              </SheetHeader>
              <div className='grid gap-4 py-8'>
                <button
                  className='flex w-full select-none flex-col justify-end rounded-md bg-gradient-to-bl from-slate-900/50 to-slate-900 p-6 no-underline outline-none focus:shadow-md'
                  onClick={() => console.log('single event')}
                >
                  <FlagIcon className='h-6 w-6 text-slate-50' />
                  <div className='mb-2 mt-4 text-lg font-medium text-slate-50'>
                    Single event
                  </div>
                  <p className='text-left text-sm leading-tight text-slate-400'>
                    Create a one-off event.
                  </p>
                </button>
                <button
                  className='flex w-full select-none flex-col justify-end rounded-md bg-gradient-to-bl from-slate-900/50 to-slate-900 p-6 no-underline outline-none focus:shadow-md'
                  onClick={() => console.log('championship event')}
                >
                  <TrophyIcon className='h-6 w-6 text-slate-50' />
                  <div className='mb-2 mt-4 text-lg font-medium text-slate-50'>
                    Championship event
                  </div>
                  <p className='text-left text-sm leading-tight text-slate-400'>
                    Create an event that is a part of a championship.
                  </p>
                </button>
              </div>
              {/* <SheetFooter>
                <SheetClose asChild>
                  <Button type='submit'>Save changes</Button>
                </SheetClose>
              </SheetFooter> */}
            </SheetContent>
          </Sheet>
        </DashboardLayout>
      </div>
    </>
  );
};

export default Calendar;

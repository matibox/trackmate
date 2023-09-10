import { CalendarPlusIcon } from 'lucide-react';
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
                <SheetTitle>Create event</SheetTitle>
                <SheetDescription>
                  Fill event details and click create when you&apos;re done.
                </SheetDescription>
              </SheetHeader>
              <div className='grid gap-4 py-4'>{/* form */}</div>
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

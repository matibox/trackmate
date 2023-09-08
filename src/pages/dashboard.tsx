import { type GetServerSidePropsContext, type NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import { Toaster } from '~/components/ui/Toaster';
import { useToast } from '~/components/ui/useToast';
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

const Dashboard: NextPage = () => {
  const { data: session } = useSession();
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
      void router.push('/dashboard', undefined, { shallow: true });
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [welcome, toast, router]);

  return (
    <div className='relative h-screen'>
      <Toaster />
      <div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4'>
        <span className='text-5xl font-medium'>Dashboard</span>
        {session ? <Button onClick={() => signOut()}>Sign out</Button> : null}
      </div>
    </div>
  );
};

export default Dashboard;

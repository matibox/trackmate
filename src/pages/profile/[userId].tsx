import { type GetServerSideProps, type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useError } from '../../hooks/useError';
import { getServerAuthSession } from '../../server/auth';
import { api, type RouterOutputs } from '../../utils/api';
import UserData from '~/features/profile/UserData';
import Stats from '~/features/profile/Stats';
import Events from '~/features/profile/Events';

type Profile = RouterOutputs['user']['getProfile'];

const Profile: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { Error, setError } = useError();

  const { data: profile, isLoading } = api.user.getProfile.useQuery(
    { userId: userId as string },
    {
      enabled: Boolean(userId),
      onError: err => setError(err.message),
    }
  );

  return (
    <>
      <NextSeo title={profile?.name ?? 'Profile'} />
      <main className='relative min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <Error />
        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3'>
          <UserData profile={profile} isLoading={isLoading} />
          <Stats profile={profile} isLoading={isLoading} />
          <Events profile={profile} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default Profile;

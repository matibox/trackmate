import { type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Settings from '../../components/Settings';

const Profile: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  console.log(userId);

  return (
    <>
      <NextSeo title='All championships' />
      <Navbar />
      <main className='min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <Settings />
        {/*// TODO: user profile */}
      </main>
    </>
  );
};

export default Profile;

import { type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import Navbar from '../../components/Navbar';
import Settings from '../../components/Settings';

const TeamProfile: NextPage = () => {
  return (
    <>
      <NextSeo title='Team profile' />
      <Navbar />
      <main className='relative min-h-screen w-full bg-slate-900 pt-[var(--navbar-height)] text-slate-50'>
        <Settings />
        <div className='flex h-[calc(100vh_-_var(--navbar-height))] items-center justify-center'>
          <h1 className='text-2xl font-semibold sm:text-4xl'>Coming soon</h1>
        </div>
      </main>
    </>
  );
};

export default TeamProfile;

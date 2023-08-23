import Rally1 from '/public/images/rally-1.png';
import GT1 from '/public/images/gt-1.png';
import Logo from '/public/images/TM_Symbol_2.png';

import { type GetServerSidePropsContext, type NextPage } from 'next';
import SimImage from '~/components/SimImage';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';

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

  // TODO: check if user already got through get started process

  return {
    props: {
      session,
    },
  };
}

const Welcome: NextPage = () => {
  return (
    <div className='relative flex h-[100dvh] flex-col xl:flex-row'>
      <header className='absolute left-0 top-0 z-10 flex w-full justify-start p-3'>
        <Image src={Logo} alt='TrackMate logo' width={45} />
      </header>
      <SimImage sources={[Rally1, GT1]} priority />
      <main className='relative z-10 flex h-1/2 flex-col items-center border-y border-slate-900 bg-slate-950 px-4 py-6 sm:gap-16 xl:h-full xl:w-1/3'>
        <div className='flex flex-col gap-0.5 text-center'>
          <h1 className='text-3xl font-bold'>
            Welcome to <span className='text-sky-500'>TrackMate</span>
          </h1>
          <p className='text-sm leading-[18px] text-slate-300'>
            Fill in your data to continue with the app. We use your name only
            for displaying purposes.
          </p>
        </div>
      </main>
      <SimImage sources={[GT1, Rally1]} />
      {/* gradient */}
      <div className='absolute h-full w-full bg-gradient-radial from-sky-500/20 via-sky-500/10 opacity-20' />
    </div>
  );
};

export default Welcome;

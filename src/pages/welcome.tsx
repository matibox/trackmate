import Rally1 from '/public/images/rally-1.png';
import GT1 from '/public/images/gt-1.png';
import Logo from '/public/images/TM_Symbol_2.png';

import { type GetServerSidePropsContext, type NextPage } from 'next';
import SimImage from '~/components/SimImage';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';
import { type ReactNode } from 'react';
import WelcomeLayout from '~/core/welcome/components/Layout';
import { useWelcomeForm } from '~/core/welcome/store/formStore';
import StepOne from '~/core/welcome/components/StepOne';

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

const steps: ReactNode[] = [<StepOne key={1} />];

const Welcome: NextPage = () => {
  const stepIndex = useWelcomeForm(state => state.stepIndex);

  return (
    <div className='relative flex h-[100dvh] flex-col xl:flex-row'>
      <header className='absolute left-0 top-0 z-10 flex w-full justify-start p-3'>
        <Image src={Logo} alt='TrackMate logo' width={36} />
      </header>
      <SimImage sources={[Rally1, GT1]} priority />
      <main className='relative z-10 min-h-[50%] w-full border-y border-slate-900 bg-slate-950 p-6 xl:h-full xl:w-2/5 xl:p-16'>
        <WelcomeLayout
          title='Welcome to TrackMate'
          description='Fill in your data to continue with the app. We use your name only for displaying purposes.'
        >
          {steps[stepIndex]}
        </WelcomeLayout>
      </main>
      <footer className='absolute bottom-0 w-full pb-4 text-center text-sm'>
        Step {stepIndex + 1} of 3
      </footer>
      <SimImage sources={[GT1, Rally1]} />
      {/* gradient */}
      <div className='absolute h-full w-full bg-gradient-radial from-sky-500/20 via-sky-500/10 opacity-20' />
    </div>
  );
};

export default Welcome;

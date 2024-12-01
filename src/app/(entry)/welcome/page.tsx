import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';
import WelcomeForm from './_components/WelcomeForm';
import { auth } from '~/server/auth';

export default async function WelcomePage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  const profile = await api.user.profile();

  if (profile) {
    redirect('/dashboard');
  }

  return (
    <div className="relative flex flex-col items-center gap-7 px-8 md:gap-9 xl:h-full xl:gap-16">
      <div className="flex flex-col gap-0.5 text-center sm:gap-1 lg:gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl 2xl:text-5xl">
          Welcome to
          <span className="text-sky-500"> TrackMate</span>
        </h1>
        <p className="text-xs leading-[18px] text-slate-300 sm:text-sm lg:text-base">
          In order to start using TrackMate, please fill in your personal data.
          This data is only used for displaying purposes.
        </p>
      </div>
      <div className="flex grow items-center justify-center">
        <WelcomeForm />
      </div>
    </div>
  );
}

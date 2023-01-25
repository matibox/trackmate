import { type GetServerSideProps, type NextPage } from 'next';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { getServerAuthSession } from '../server/auth';

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Login - Race Results</title>
      </Head>
      <main className='flex min-h-screen w-screen flex-col items-center justify-center gap-6 bg-slate-900'>
        <Image src='/Full.png' alt='' width={100} height={100} />
        <div className='flex h-full w-11/12 max-w-lg flex-col gap-4 rounded-md bg-slate-800 p-4 shadow-lg ring-1 ring-slate-700 sm:gap-6 sm:p-6'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-center text-3xl font-medium text-slate-50 sm:text-4xl'>
              Welcome back
            </h1>
            <p className='text-center text-sm text-slate-300 sm:text-base'>
              Revisited race planning and results posting
            </p>
          </div>
          <button
            className='flex w-full items-center justify-center gap-2  rounded bg-[hsl(227,58%,65%)] py-2 px-4 font-medium text-slate-50 transition-colors hover:bg-[hsl(227,58%,70%)]'
            onClick={() => void signIn('discord')}
          >
            <span>Sign in with discord</span>
            <Image
              src='/Discord.png'
              alt='Discord'
              width={20}
              height={15}
              className='translate-y-[1px]'
            />
          </button>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: '/welcome',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Login;

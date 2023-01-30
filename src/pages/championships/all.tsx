import { Disclosure } from '@headlessui/react';
import {
  ArrowTopRightOnSquareIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import Loading from '@ui/Loading';
import { type GetServerSideProps, type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { type FC } from 'react';
import Navbar from '../../components/Navbar';
import { useError } from '../../hooks/useError';
import cn from '../../lib/classes';
import { getServerAuthSession } from '../../server/auth';
import { api, type RouterOutputs } from '../../utils/api';
import { capitilize, hasRole } from '../../utils/helpers';

const AllChampionships: NextPage = () => {
  const { Error, setError } = useError();
  const { data: championships, isLoading } = api.championship.get.useQuery(
    { max: 0 },
    {
      onError(err) {
        setError(err.message);
      },
    }
  );

  return (
    <>
      <Head>
        <title>All championships | Race Results App</title>
        <meta name='description' content='Race results app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
      <main className='min-h-[calc(100vh_-_var(--navbar-height))] w-full bg-slate-900 text-slate-50'>
        <Link
          href='/'
          className='flex items-center gap-2 pl-4 pt-4 text-slate-300 transition-colors hover:text-sky-400'
        >
          <ChevronLeftIcon className='h-5' />
          <span className='text-base font-normal'>back</span>
        </Link>
        <Error />
        {isLoading && (
          <div className='flex h-[calc(100vh_-_var(--navbar-height))] w-full items-center justify-center'>
            <Loading />
          </div>
        )}
        <h1 className='p-4 text-center text-2xl font-semibold sm:text-3xl'>
          All Championships
        </h1>
        <div className='flex flex-col gap-4 p-4'>
          {championships?.map(championship => (
            <Disclosure key={championship.id}>
              {({ open }) => (
                <>
                  <Disclosure.Button className='flex w-full items-center gap-2 rounded bg-slate-800 px-4 py-2 text-left text-lg font-semibold text-slate-50 ring-1 ring-slate-700 transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75'>
                    <ChevronUpIcon
                      className={cn(
                        'h-5 w-5 text-sky-400 transition-transform',
                        {
                          'rotate-180 transform': open,
                        }
                      )}
                    />
                    <span>
                      {championship.organizer} - {championship.name}
                    </span>
                  </Disclosure.Button>
                  <Disclosure.Panel className='px-4'>
                    <div className='flex w-full flex-col gap-4'>
                      <a
                        href={championship.link}
                        className='group flex items-center gap-2 font-semibold transition-colors hover:text-sky-400'
                      >
                        <span>Championship website</span>
                        <ArrowTopRightOnSquareIcon className='h-5 text-slate-300 transition-colors group-hover:text-sky-400' />
                      </a>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                        <div className='flex flex-col'>
                          <span className='text-slate-300'>Car</span>
                          <span className='text-slate-50'>
                            {capitilize(
                              championship.car === '' || !championship.car
                                ? '-'
                                : championship.car
                            )}
                          </span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-slate-300'>Type</span>
                          <span className='text-slate-50'>
                            {capitilize(championship.type)}
                          </span>
                        </div>
                      </div>
                      <div className='border-t border-slate-800 pt-4'>
                        <h2 className='text-lg font-semibold'>Events</h2>
                        <div className='grid grid-cols-[repeat(auto-fill,_250px)]'>
                          {championship.events.map(event => (
                            <Event key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </main>
    </>
  );
};

const Event: FC<{
  event: RouterOutputs['championship']['get'][number]['events'][number];
}> = ({ event }) => {
  //TODO event content
  return <div>{event.title}</div>;
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

  if (!hasRole(session, 'driver')) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default AllChampionships;

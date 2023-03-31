import { PlusIcon } from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Loading from '@ui/Loading';
import Tile from '@ui/Tile';
import { type NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useError } from '../hooks/useError';
import { usePostSetupStore } from '../store/usePostSetupStore';
import { api } from '../utils/api';

const YourSetups: NextPage = () => {
  const { Error, setError } = useError();
  const { data: setups, isLoading } = api.setup.getAll.useQuery(undefined, {
    onError: err => setError(err.message),
  });

  const { open } = usePostSetupStore();

  return (
    <>
      <NextSeo title='Your setups' />
      <main className='min-h-screen w-full bg-slate-900 px-4 pt-[var(--navbar-height)] text-slate-50'>
        <Error />
        {isLoading && (
          <div className='flex h-screen w-full items-center justify-center'>
            <Loading />
          </div>
        )}
        <h1 className='pt-4 pb-8 text-center text-2xl font-semibold sm:text-3xl'>
          Your Setups
        </h1>
        <div className='flex flex-col gap-4 md:flex-row'>
          <Tile className='md:basis-1/4 lg:basis-1/5'>
            <div className='flex w-full flex-col gap-4'>
              <label className='flex w-full items-center gap-2'>
                <MagnifyingGlassIcon className='h-5' />
                <Input
                  className='h-7'
                  placeholder='Search setup'
                  error={undefined}
                />
              </label>
              <Button
                intent='primary'
                size='small'
                gap='small'
                className='ml-auto self-end'
                onClick={open}
              >
                <span>New setup</span>
                <PlusIcon className='h-5' />
              </Button>
            </div>
          </Tile>
          <Tile className='flex-1'>no</Tile>
        </div>
      </main>
    </>
  );
};

export default YourSetups;

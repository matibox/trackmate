import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { type FC } from 'react';
import Button from '@ui/Button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { BellIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../store/useSettingsStore';

const Navbar: FC = () => {
  const { open: openSettings } = useSettingsStore();

  return (
    <nav className='flex h-[var(--navbar-height)] items-center gap-4 border-b border-slate-700 bg-slate-800 px-4'>
      <Link href='/' aria-label='dashboard'>
        <Image src='/Mono.png' alt='' width={50} height={50} />
      </Link>
      <Button
        intent='secondary'
        size='small'
        className='ml-auto'
        gap='small'
        onClick={() => void signOut()}
      >
        <span>Sign out</span>
        <ArrowLeftOnRectangleIcon className='h-[18px]' />
      </Button>
      <div className='flex items-center gap-2'>
        <button
          className='text-slate-300 transition-colors hover:text-slate-50'
          //TODO notifications
        >
          {/*//TODO notification counter */}
          <BellIcon className='h-5' />
        </button>
        <button
          className='text-slate-300 transition-colors hover:text-slate-50'
          onClick={openSettings}
        >
          <Cog8ToothIcon className='h-5' />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

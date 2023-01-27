import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { type FC } from 'react';
import Button from '@ui/Button';
import { signOut } from 'next-auth/react';

const Navbar: FC = () => {
  return (
    <nav className='flex h-[var(--navbar-height)] items-center border-b border-slate-700 bg-slate-800 px-4'>
      <Image src='/Mono.png' alt='' width={50} height={50} />
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
    </nav>
  );
};

export default Navbar;

import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useRef, useState, type FC } from 'react';
import Button from '@ui/Button';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { BellIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../store/useSettingsStore';
import cn from '../lib/classes';
import { useNotificationStore } from '../store/useNotificationsStore';
import Notifications from './Notifications';
import { motion } from 'framer-motion';

const Navbar: FC = () => {
  const { open: openSettings } = useSettingsStore();
  const {
    toggle: toggleNotifications,
    isOpened: notificationsOpened,
    unread,
  } = useNotificationStore();

  const { data: session } = useSession();

  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const notificationsBtnRef = useRef<HTMLButtonElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <nav className='fixed z-20 flex h-[var(--navbar-height)] w-full items-center gap-4 border-b border-slate-700 bg-slate-800 px-4'>
      <Link href='/' aria-label='dashboard'>
        <Image
          src='/Mono.png'
          alt='Logo'
          width={50}
          height={50}
          priority={true}
        />
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
          className={cn(
            'relative text-slate-300 transition-colors hover:text-slate-50',
            {
              'text-sky-400 hover:text-sky-300': notificationsOpened,
            }
          )}
          aria-label='Notifications'
          onClick={toggleNotifications}
          ref={notificationsBtnRef}
        >
          <div
            className={cn(
              'absolute top-0 right-0 hidden h-2 w-2 items-center justify-center rounded-full bg-sky-400 text-xs text-white',
              {
                flex: unread,
              }
            )}
          />
          <BellIcon className='h-5' />
        </button>
        <button
          className='text-slate-300 transition-colors hover:text-slate-50'
          onClick={openSettings}
          aria-label='Settings'
        >
          <Cog8ToothIcon className='h-5' />
        </button>
        <button
          className='flex items-center gap-0.5 text-slate-300 hover:text-slate-50'
          onClick={() => setUserMenuOpened(prev => !prev)}
          ref={userBtnRef}
        >
          <Image
            src={session?.user?.image ?? '/DefaultAvatar.png'}
            alt={`${session?.user?.name ?? 'user'}'s profile picture`}
            width={21}
            height={21}
            priority={true}
            className='rounded-full ring-1 ring-slate-700'
          />
          <motion.div animate={{ rotate: userMenuOpened ? 180 : 0 }}>
            <ChevronDownIcon className='h-4 transition-colors' />
          </motion.div>
        </button>
      </div>
      <Notifications buttonRef={notificationsBtnRef} />
    </nav>
  );
};

export default Navbar;

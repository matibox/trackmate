import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useRef, useState, type FC } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BellIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useSettingsStore } from '../store/useSettingsStore';
import cn from '../lib/classes';
import { useNotificationStore } from '../store/useNotificationsStore';
import Notifications from './Notifications';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '../hooks/useClickOutside';

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
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setUserMenuOpened(false), [userBtnRef]);

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
      <div className='ml-auto flex items-center gap-3'>
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
      <AnimatePresence>
        {userMenuOpened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className='absolute top-[calc(var(--navbar-height)_+_0.5rem)] right-4 z-20 flex max-h-72 w-44 flex-col gap-2 rounded bg-slate-800 py-2 text-sm font-semibold leading-4 text-slate-50 ring-1 ring-slate-700 drop-shadow-xl'
            ref={userMenuRef}
          >
            <div className='flex flex-col gap-2 px-4'>
              <span>Welcome, {session?.user?.name}</span>
            </div>
            <div className='h-[1px] w-full bg-slate-700' />
            <div className='flex flex-col gap-2 px-4'>
              <Link
                href={`/user/${session?.user?.id as string}`}
                className='flex items-center justify-between transition-colors hover:text-sky-400'
              >
                <span>Your profile</span>
                <UserCircleIcon className='h-[18px]' />
              </Link>
            </div>
            <div className='h-[1px] w-full bg-slate-700' />
            <div className='flex flex-col gap-2 px-4'>
              <button
                className='flex items-center justify-between transition-colors hover:text-sky-400'
                onClick={openSettings}
                aria-label='Settings'
              >
                <span>Settings</span>
                <Cog8ToothIcon className='h-[18px]' />
              </button>
              <button
                className='flex items-center justify-between transition-colors hover:text-sky-400'
                onClick={() => void signOut()}
                aria-label='Settings'
              >
                <span>Sign out</span>
                <ArrowLeftOnRectangleIcon className='h-[18px]' />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Notifications buttonRef={notificationsBtnRef} />
    </nav>
  );
};

export default Navbar;

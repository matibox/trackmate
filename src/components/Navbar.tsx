import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useRef, type FC } from 'react';
import Button from '@ui/Button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { BellIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../store/useSettingsStore';
import cn from '../lib/classes';
import { useNotificationStore } from '../store/useNotificationsStore';
import Notifications from './Notifications';

const Navbar: FC = () => {
  const { open: openSettings } = useSettingsStore();
  const { toggle: toggleNotifications, isOpened: notificationsOpened } =
    useNotificationStore();

  const notificationsBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <nav className='fixed z-20 flex h-[var(--navbar-height)] w-full items-center gap-4 border-b border-slate-700 bg-slate-800 px-4'>
      <Link href='/' aria-label='dashboard'>
        <Image src='/Mono.png' alt='Logo' width={50} height={50} />
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
                // TODO: enable if user has unread notifications
                flex: false,
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
      </div>
      <Notifications buttonRef={notificationsBtnRef} />
    </nav>
  );
};

export default Navbar;

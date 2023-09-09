import Logo from '/public/images/TM_Symbol_2.png';

import {
  CalendarDays,
  Medal,
  type LucideIcon,
  Users,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { cn } from '~/lib/utils';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';

type Path = `/${string}`;

type Link = {
  label: string;
  path: Path;
  icon: LucideIcon;
};

export const links = [
  {
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Results',
    path: '/results',
    icon: Medal,
  },
  // placeholder
  {
    label: 'Teams',
    path: '/',
    icon: Users,
  },
  {
    label: 'Settings',
    path: '/',
    icon: Settings,
  },
] as const satisfies readonly Link[];

const mobileLinkVariants: Variants = {
  inactive: { scaleX: 0 },
  active: { scaleX: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

const PCLinkVariants: Variants = {
  inactive: { x: 0 },
  active: { x: 4, transition: { duration: 0.25, ease: 'easeOut' } },
  hover: {
    x: 4,
    backgroundColor: '#38bdf8',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export default function Navbar({ disabledOn = [] }: { disabledOn?: Path[] }) {
  const router = useRouter();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 z-50 flex h-20 w-full items-center bg-slate-900 ring-1 ring-slate-800 lg:top-0 lg:h-full lg:w-24 lg:flex-col lg:justify-start lg:gap-12 lg:py-6',
        {
          hidden: disabledOn.includes(router.pathname as Path),
        }
      )}
    >
      <Image
        src={Logo}
        alt='Trackmate logo'
        height={48}
        className='hidden lg:block'
      />
      <div className='flex w-full items-center justify-evenly md:justify-center md:gap-14 lg:flex-col lg:gap-6'>
        {links.map(link => {
          const isActive = router.pathname === link.path;
          return (
            <motion.div
              key={link.label}
              animate={isActive ? 'active' : 'inactive'}
              whileHover='hover'
            >
              <Link
                href={link.path}
                className='group relative flex h-[52px] w-16 flex-col items-center gap-1 lg:h-12 lg:gap-2'
              >
                <motion.div
                  className={cn('hidden h-8 w-16 rounded-2xl bg-slate-800', {
                    'flex lg:hidden': isActive,
                  })}
                  variants={mobileLinkVariants}
                  animate={isActive ? 'active' : 'inactive'}
                />
                <motion.div
                  className={cn(
                    'hidden rounded bg-sky-500 lg:absolute lg:-left-6 lg:top-1/2 lg:block lg:h-5 lg:w-2'
                  )}
                  variants={PCLinkVariants}
                  style={{
                    translateY: '-50%',
                  }}
                />
                <link.icon
                  className={cn(
                    'duration-[250ms] absolute top-1 text-slate-300 transition-colors lg:static lg:transition-colors lg:group-hover:text-sky-400',
                    {
                      'text-sky-500': isActive,
                    }
                  )}
                />
                <span
                  className={cn(
                    'duration-[250ms] mt-auto text-xs text-slate-300 transition lg:text-sm lg:transition-colors lg:group-hover:text-sky-400',
                    {
                      'text-sky-500': isActive,
                    }
                  )}
                >
                  {link.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

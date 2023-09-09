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

const linkVariants: Variants = {
  inactive: { scaleX: 0 },
  active: { scaleX: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function Navbar({ disabledOn = [] }: { disabledOn?: Path[] }) {
  const router = useRouter();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-evenly bg-slate-900 ring-1 ring-slate-800',
        {
          hidden: disabledOn.includes(router.pathname as Path),
        }
      )}
    >
      {links.map(link => {
        const isActive = router.pathname === link.path;
        return (
          <Link
            key={link.label}
            href={link.path}
            className='relative flex h-[52px] w-16 flex-col items-center gap-1'
          >
            <motion.div
              className={cn(
                'hidden h-8 w-16 items-center justify-center rounded-2xl bg-slate-800',
                {
                  flex: isActive,
                }
              )}
              variants={linkVariants}
              animate={isActive ? 'active' : 'inactive'}
            />
            <link.icon
              className={cn(
                'duration-[250ms] absolute top-1 text-slate-300 transition-colors',
                {
                  'text-sky-500': isActive,
                }
              )}
            />
            <span
              className={cn(
                'duration-[250ms] mt-auto text-xs text-slate-300 transition',
                {
                  'font-medium text-sky-500': isActive,
                }
              )}
            >
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

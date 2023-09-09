import { useRouter } from 'next/router';
import { cn } from '~/lib/utils';

type Path = `/${string}`;

type NavbarProps = {
  disabledOn?: Path[];
};

export default function Navbar({ disabledOn = [] }: NavbarProps) {
  const router = useRouter();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 h-20 w-full bg-slate-900 ring-1 ring-slate-800',
        {
          hidden: disabledOn.includes(router.pathname as Path),
        }
      )}
    ></nav>
  );
}

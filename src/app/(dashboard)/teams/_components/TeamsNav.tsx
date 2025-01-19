import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';

export default function TeamsNav() {
  return (
    <section className="flex h-16 w-full shrink-0 items-center gap-2 px-4">
      <SidebarTrigger />
      <div className="mr-2 h-4 w-px shrink-0 bg-border" />
      <span className="text-primary-foreground">Teams</span>
      <Link
        className={cn(
          buttonVariants({ variant: 'default', size: 'sm' }),
          'ml-auto'
        )}
        href="/teams/new"
      >
        <span>New team</span>
        <PlusIcon />
      </Link>
    </section>
  );
}

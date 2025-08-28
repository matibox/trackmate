import { UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '~/components/ui/button';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';

export default function TelemetryNav() {
  return (
    <section className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 bg-background px-4">
      <SidebarTrigger />
      <div className="h-4 w-px shrink-0 bg-border" />
      <span className="ml-2 text-primary-foreground">Telemetry</span>
      <Link
        className={cn(
          buttonVariants({ variant: 'default', size: 'sm' }),
          'ml-auto h-8 max-w-[2rem] md:max-w-none'
        )}
        href="/telemetry/new"
      >
        <span className="hidden md:inline-block">Upload</span>
        <UploadIcon />
      </Link>
    </section>
  );
}

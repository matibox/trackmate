import { SidebarTrigger } from '~/components/ui/sidebar';

export default function TelemetryNav() {
  return (
    <section className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 bg-background px-4">
      <SidebarTrigger />
      <div className="h-4 w-px shrink-0 bg-border" />
      <span className="ml-2 text-primary-foreground">Telemetry</span>
    </section>
  );
}

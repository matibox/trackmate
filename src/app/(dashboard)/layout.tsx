import { SidebarProvider } from '~/components/ui/sidebar';
import DashboardSidebar from './_components/DashboardSidebar';
import { cookies } from 'next/headers';
import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

  const session = await auth();
  if (!session) redirect('/');

  const profile = await api.user.profile();
  if (!profile) redirect('/welcome');

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar />
      <main className="grow">{children}</main>
    </SidebarProvider>
  );
}

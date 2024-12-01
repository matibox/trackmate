import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  const profile = await api.user.profile();

  if (!profile) {
    redirect('/welcome');
  }

  return <div>dashboard</div>;
}

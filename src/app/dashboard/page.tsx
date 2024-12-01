import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';

export default async function DashboardPage() {
  return <div>dashboard</div>;
}

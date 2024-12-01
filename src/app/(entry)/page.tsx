import { HydrateClient } from '~/trpc/server';
import Login from '~/app/(entry)/_components/Login';
import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/welcome');
  }

  return (
    <HydrateClient>
      <Login />
    </HydrateClient>
  );
}

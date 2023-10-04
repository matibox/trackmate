import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export function useProtectedRoute(destination: `/${string}` = '/login') {
  const { data: session } = useSession();
  const router = useRouter();

  if (typeof window === 'undefined') return;

  if (!session) {
    return void router.push(destination);
  }

  if (!session.user.active) void router.push('/welcome');
}

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useProtectedRoute(destination: `/${string}` = '/login') {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!session) {
      return void router.push(destination);
    }

    if (!session.user.active) void router.push('/welcome');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, session]);
}

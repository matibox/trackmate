import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useProtectedRoute(destination: `/${string}` = '/login') {
  const router = useRouter();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => {
      void router.push(destination);
    },
  });

  useEffect(() => {
    if (!session?.user.active) {
      void router.push('/welcome');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

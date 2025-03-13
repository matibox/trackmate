'use client';

import { HomeIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '~/components/ui/button';
import Logo from '~/../public/images/TM_Symbol_2.png';

export default function Error({ error }: { error: Error; reset: () => void }) {
  console.error(error);

  return (
    <div className="flex min-h-[100dvh] min-w-[100dvw] flex-col items-center justify-center gap-4">
      <Image src={Logo} alt="TrackMate logo" className="w-[150px]" priority />
      <h1 className="text-2xl font-medium">Something went wrong!</h1>
      <Button
        onClick={() => {
          // router.push() doesn't work here
          window.location.href = '/dashboard';
        }}
      >
        Return to dashboard
        <HomeIcon />
      </Button>
    </div>
  );
}

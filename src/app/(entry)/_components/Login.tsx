'use client';

import Image from 'next/image';
import Logo from '../../../../public/images/TM_Symbol_2_Text.png';
import { Button } from '~/components/ui/button';
import { signIn } from 'next-auth/react';

export default function Login() {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Image
          src={Logo}
          alt="TrackMate logo"
          className="w-[221px] xl:w-[354px]"
          priority
        />
        <span className="text-center text-slate-300 xl:text-xl">
          Plan, Race, Win - Your Simracing Scheduler
        </span>
      </div>
      <div className="flex flex-col items-center gap-3 xl:gap-6">
        <span className="text-xl xl:text-2xl">Sign in with</span>
        <Button variant="outline" onClick={() => void signIn('discord')}>
          <Image
            src="/images/Discord.svg"
            alt="Discord logo"
            className="mr-2"
            width={22}
            height={16}
          />
          <span>Discord</span>
        </Button>
      </div>
    </>
  );
}

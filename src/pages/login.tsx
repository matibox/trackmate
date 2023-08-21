import { type NextPage } from 'next';
import { MoveLeft, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { cn } from '~/lib/utils';

import Logo from '/public/images/TM_Symbol_2_Text.png';
import Rally1 from '/public/images/rally-1.png';
import GT1 from '/public/images/gt-1.png';

const Login: NextPage = () => {
  return (
    <div className='relative flex h-screen flex-col xl:flex-row'>
      <header className='absolute left-0 top-0 z-10 flex w-full justify-end p-4 xl:justify-start'>
        <Button variant='ghost' size='icon' asChild aria-label='back'>
          <Link href='/'>
            <X className='xl:hidden' />
            <MoveLeft className='hidden xl:block' />
          </Link>
        </Button>
      </header>
      <BgImage src={Rally1} alt='' priority />
      <main className='flex h-1/2 flex-col items-center justify-center gap-16 border-y border-slate-900 py-10 xl:h-full xl:w-1/3'>
        <div className='flex flex-col items-center gap-2'>
          <Image
            src={Logo}
            alt='TrackMate logo'
            className='w-[221px] xl:w-[354px]'
            priority
          />
          <span className='text-center text-slate-300 xl:text-xl'>
            Plan, Race, Win - Your Simracing Scheduler
          </span>
        </div>
        <div className='flex flex-col items-center gap-3 xl:gap-6'>
          <span className='text-xl xl:text-2xl'>Sign in with</span>
          <Button variant='outline'>
            <Image
              src='/images/Discord.svg'
              alt='Discord logo'
              className='mr-2'
              width={22}
              height={16}
            />
            <span>Discord</span>
          </Button>
        </div>
      </main>
      <BgImage src={GT1} alt='' />
    </div>
  );
};

type BgImageProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
  priority?: boolean;
};

function BgImage({ src, alt, className, priority = false }: BgImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={cn(
        'h-1/4 w-full object-cover opacity-10 xl:h-full xl:w-1/3',
        className
      )}
      priority={priority}
    />
  );
}

export default Login;

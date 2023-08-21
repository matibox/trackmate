import { type NextPage } from 'next';
import { X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';

import Logo from '/public/images/TM_Symbol_2_Text.png';
import Rally1 from '/public/images/rally-1.png';
import FormulaOne1 from '/public/images/f1-1.png';
import { cn } from '~/lib/utils';

const Login: NextPage = () => {
  return (
    <div className='relative flex h-screen flex-col'>
      <header className='absolute left-0 top-0 z-10 flex w-full justify-end p-4'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/'>
            <X />
          </Link>
        </Button>
      </header>
      <BgImage src={Rally1} alt='' />
      <main className='flex grow flex-col items-center justify-between border-y border-slate-900 py-10'>
        <div className='flex flex-col items-center gap-2'>
          <Image
            src={Logo}
            alt='TrackMate logo'
            className='w-[221px]'
            priority
          />
          <span className='antial text-center text-slate-300'>
            Plan, Race, Win - Your Simracing Scheduler
          </span>
        </div>
        <div className='flex flex-col items-center gap-3'>
          <span className='text-xl'>Sign in with</span>
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
      <BgImage src={FormulaOne1} alt='' />
    </div>
  );
};

type BgImageProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
};

function BgImage({ src, alt, className }: BgImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={cn('h-[191px] object-cover opacity-10', className)}
    />
  );
}

export default Login;

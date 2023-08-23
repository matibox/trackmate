import Logo from '/public/images/TM_Symbol_2_Text.png';
import Rally1 from '/public/images/rally-1.png';
import GT1 from '/public/images/gt-1.png';

import { type NextPage } from 'next';
import { MoveLeft, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { cn } from '~/lib/utils';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useToast } from '~/components/ui/use-toast';
import { Toaster } from '~/components/ui/toaster';

const Login: NextPage = () => {
  const router = useRouter();
  const { error } = router.query as { error: string | undefined };
  const { toast } = useToast();

  useEffect(() => {
    if (!error) return;
    toast({
      variant: 'destructive',
      title: 'Something went wrong.',
      description: 'Try signing in with a different account.',
    });
  }, [error, toast]);

  async function login() {
    if (error) await router.replace('/login', undefined, { shallow: true });
    await signIn('discord');
  }

  return (
    <div className='relative flex h-[100dvh] flex-col xl:flex-row'>
      <Toaster />
      <header className='absolute left-0 top-0 z-10 flex w-full justify-end p-4 xl:justify-start'>
        <Button variant='ghost' size='icon' asChild aria-label='back'>
          <Link href='/'>
            <X className='xl:hidden' />
            <MoveLeft className='hidden xl:block' />
          </Link>
        </Button>
      </header>
      <BgImage sources={[Rally1, GT1]} priority />
      <main className='relative z-10 flex h-1/2 flex-col items-center justify-between border-y border-slate-900 bg-slate-950 py-10 sm:justify-center sm:gap-16 xl:h-full xl:w-1/3'>
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
          <Button variant='outline' onClick={() => void login()}>
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
      <BgImage sources={[GT1, Rally1]} />
      {/* gradient */}
      <div className='absolute h-full w-full bg-gradient-radial from-sky-500/20 via-sky-500/10 opacity-20' />
    </div>
  );
};

type BgImageProps = {
  sources: StaticImageData[];
  className?: string;
  priority?: boolean;
};

function BgImage({ sources, className, priority = false }: BgImageProps) {
  return (
    <div className='relative h-1/4 w-full xl:h-full xl:w-1/3'>
      {sources.map((source, i) => (
        <Image
          key={source.src}
          src={source}
          alt=''
          className={cn(
            'absolute left-0 top-0 h-full w-full animate-image-carousel object-cover opacity-0',
            className
          )}
          style={{
            animationDelay: `${i * 20}s`,
          }}
          priority={priority}
        />
      ))}
    </div>
  );
}

export default Login;

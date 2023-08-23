import { type ReactNode } from 'react';

type WelcomeLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function WelcomeLayout({
  title,
  description,
  children,
}: WelcomeLayoutProps) {
  const titleWords = title.split(' ');

  return (
    <div className='flex flex-col items-center gap-9 xl:h-full xl:gap-16'>
      <div className='flex flex-col gap-0.5 text-center sm:gap-1 lg:gap-3'>
        <h1 className='text-3xl font-bold sm:text-4xl 2xl:text-5xl'>
          {titleWords.slice(0, titleWords.length - 1).join(' ')}{' '}
          <span className='text-sky-500'>
            {titleWords[titleWords.length - 1]}
          </span>
        </h1>
        <p className='text-xs leading-[18px] text-slate-300 sm:text-sm lg:text-lg'>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

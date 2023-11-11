import { type ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className='h-full min-h-[inherit] w-full p-4 pb-[10.5rem] lg:pb-4 lg:pl-40 lg:pt-[4.5rem]'>
      {children}
    </main>
  );
}

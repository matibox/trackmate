import { type ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className='h-full w-full p-4 pb-[10.5rem] lg:pb-4 lg:pl-40'>
      {children}
    </main>
  );
}

import { type ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <main className='h-full w-full lg:pl-24'>{children}</main>;
}

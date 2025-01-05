import { type ReactNode } from 'react';
import { SheetDescription, SheetTitle } from '~/components/ui/sheet';

export default function Step({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <SheetTitle>{title}</SheetTitle>
      <SheetDescription>{description}</SheetDescription>
      <div className="mx-auto flex w-4/5 flex-col gap-4 py-8 text-slate-50">
        {children}
      </div>
    </>
  );
}

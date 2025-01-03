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
      {children}
    </>
  );
}

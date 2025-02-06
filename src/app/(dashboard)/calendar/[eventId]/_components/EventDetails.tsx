'use client';

import { useRouter } from 'next/navigation';
import ResponsiveDialog from '~/components/ui/responsive-dialog';

export default function EventDetails() {
  // TODO get event id from serach params
  const router = useRouter();

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={open => {
        if (!open) router.back();
      }}
      title=""
      description=""
    >
      event details
    </ResponsiveDialog>
  );
}

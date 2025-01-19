'use client';

import { useRouter } from 'next/navigation';
import ResponsiveDialog from '~/components/ui/responsive-dialog';

export default function NewTeam() {
  const router = useRouter();

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={open => {
        if (!open) router.back();
      }}
      title="New team"
      description="A team helps you build and manage your racing team effortlessly. Stay ahead of the competition!"
    >
      test
    </ResponsiveDialog>
  );
}

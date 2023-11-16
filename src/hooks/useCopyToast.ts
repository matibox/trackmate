import { useCallback } from 'react';
import { useToast } from '~/components/ui/useToast';

export function useCopyToast() {
  const { toast } = useToast();

  const copy = useCallback(
    async ({ valueToCopy }: { valueToCopy: string }) => {
      await window.navigator.clipboard.writeText(valueToCopy);
      toast({
        title: 'Value copied to clipboard',
      });
    },
    [toast]
  );

  return { copyWithToast: copy };
}

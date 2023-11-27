import { useCallback, useState } from 'react';
import { useToast } from '~/components/ui/useToast';
import { api } from '~/utils/api';

export function useSetupDownload() {
  const { toast } = useToast();
  const [currentDownloadSetupId, setCurrentDownloadSetupId] =
    useState<string>();

  const { mutateAsync: decryptSetup, isLoading } =
    api.setup.decrypt.useMutation({
      onError: ({ message }) => {
        toast({
          title: 'An error occured',
          description: message,
        });
      },
      onMutate: ({ setupId }) => setCurrentDownloadSetupId(setupId),
      onSettled: () => setCurrentDownloadSetupId(undefined),
    });

  const download = useCallback(
    async ({
      setup: { id, name },
    }: {
      setup: { id: string; name: string };
    }) => {
      const setupData = await decryptSetup({ setupId: id });
      const href = `data:text/json;chatset=utf-8,${encodeURIComponent(
        setupData
      )}`;
      const link = document.createElement('a');
      link.href = href;
      link.download = `${name}.json`;
      link.click();
      link.remove();
    },
    [decryptSetup]
  );

  return { download, isLoading, currentDownloadSetupId };
}

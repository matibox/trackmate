import { useCallback, useState } from 'react';
import { useToast } from '~/components/ui/useToast';
import { type RouterOutputs, api } from '~/utils/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

type Setup = RouterOutputs['event']['getSetups'][number];
type Event = RouterOutputs['event']['fromTo'][number]['event'];

export function useSetupDownload() {
  const { toast } = useToast();
  const [currentDownloadSetupIds, setCurrentDownloadSetupIds] =
    useState<string>();
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);

  const { mutateAsync: decryptSetup, isLoading: decryptLoading } =
    api.setup.decrypt.useMutation({
      onError: ({ message }) => {
        toast({
          title: 'An error occured',
          description: message,
        });
      },
      onMutate: ({ setupId }) => setCurrentDownloadSetupIds(setupId),
      onSettled: () => setCurrentDownloadSetupIds(undefined),
    });

  const download = useCallback(
    async ({ setup: { id, name } }: { setup: Pick<Setup, 'id' | 'name'> }) => {
      const setupData = await decryptSetup({ setupId: id });

      saveAs(
        new Blob([(JSON.parse(setupData) as object).toString()], {
          type: 'application/json',
        }),
        `${name}.json`
      );
    },
    [decryptSetup]
  );

  type DownloadManyProps = {
    setups: Array<Pick<Setup, 'id' | 'name'>>;
    event: Pick<Event, 'name'>;
  };

  const downloadMany = useCallback(
    async ({ setups, event }: DownloadManyProps) => {
      setDownloadAllLoading(true);
      const zip = new JSZip();
      const name = `${event.name.replaceAll(' ', '_')}_${dayjs().format(
        'DDMMYY'
      )}_TM_SETUPS`;

      const folder = zip.folder(name);

      if (!folder) return;

      for (const setup of setups) {
        const setupData = await decryptSetup({ setupId: setup.id });
        folder.file(
          `${setup.name}.json`,
          (JSON.parse(setupData) as object).toString()
        );
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${name}.zip`);
      setDownloadAllLoading(false);
    },
    [decryptSetup]
  );

  return {
    download,
    downloadMany,
    isLoading: decryptLoading || downloadAllLoading,
    currentDownloadSetupId: currentDownloadSetupIds,
  };
}

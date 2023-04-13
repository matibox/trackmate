import { type Dispatch, type SetStateAction, useCallback } from 'react';
import { api } from '../utils/api';

export default function useSetupDownload(
  setError: Dispatch<SetStateAction<string | undefined>>
) {
  const utils = api.useContext();
  const { mutateAsync: getSetupData, isLoading: setupDataLoading } =
    api.setup.decryptData.useMutation({
      onError: err => setError(err.message),
    });

  const { mutateAsync: logDownload, isLoading: downloadLoading } =
    api.setup.logDownload.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.setups.invalidate();
      },
    });

  const download = useCallback(
    async (setupId: string, name: string) => {
      const setupData = await getSetupData({ setupId });
      await logDownload({ setupId });
      const href = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(setupData)
      )}`;
      const link = document.createElement('a');
      link.href = href;
      link.download = `${name}.json`;
      link.click();
      link.remove();
    },
    [getSetupData, logDownload]
  );

  return { download, isLoading: setupDataLoading || downloadLoading };
}

import { type Dispatch, type SetStateAction, useCallback } from 'react';
import { api } from '../utils/api';

export default function useSetupDownload(
  setError: Dispatch<SetStateAction<string | undefined>>
) {
  const { mutateAsync: getSetupData, isLoading } =
    api.setup.decryptData.useMutation({
      onError: err => setError(err.message),
    });

  const download = useCallback(
    async (setupId: string, name: string) => {
      const setupData = await getSetupData({ setupId });
      const href = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(setupData)
      )}`;
      const link = document.createElement('a');
      link.href = href;
      link.download = `${name}.json`;
      link.click();
      link.remove();
    },
    [getSetupData]
  );

  return { download, isLoading };
}

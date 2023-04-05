import { useCallback } from 'react';
import { type JSONValue } from 'superjson/dist/types';

export default function useJSONDownload() {
  const downloadJSON = useCallback((name: string, data: JSONValue) => {
    const href = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement('a');
    link.href = href;
    link.download = `${name}.json`;
    link.click();
    link.remove();
  }, []);

  return downloadJSON;
}

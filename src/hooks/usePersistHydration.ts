import { useEffect, useState } from 'react';

export function usePersistHydration<T>(value: T) {
  const [shownValue, setShownValue] = useState<T>();

  useEffect(() => {
    setShownValue(value);
  }, [value]);

  return shownValue;
}

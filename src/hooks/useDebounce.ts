import { useEffect, useState } from 'react';

export default function useDebounce<T>(value: T, delay = 500) {
  const [state, setState] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setState(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return state;
}

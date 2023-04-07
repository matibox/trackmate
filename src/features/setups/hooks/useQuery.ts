import { useCallback, useEffect, useState } from 'react';
import useDebounce from '~/hooks/useDebounce';
import { type RouterOutputs } from '~/utils/api';

type Setups = RouterOutputs['setup']['getAll'];

export default function useQuery(query: string, setups: Setups | undefined) {
  const debouncedQuery = useDebounce(query);
  const [filteredSetups, setFilteredSetups] = useState(setups);

  const someIncludes = useCallback((items: string[], string: string) => {
    return items.some(item => item.includes(string));
  }, []);

  useEffect(() => {
    if (!setups) return;
    const q = debouncedQuery;
    setFilteredSetups(() =>
      setups.filter(setup => {
        const {
          author: { name: authorName },
          car,
          name,
          track,
        } = setup;
        return someIncludes([authorName ?? '', car, name, track], q);
      })
    );
  }, [someIncludes, debouncedQuery, setups]);

  return filteredSetups;
}

import { useCallback, useMemo } from 'react';
import { type RouterOutputs } from '~/utils/api';

type Profile = RouterOutputs['user']['getProfile'];
type Result = NonNullable<NonNullable<Profile>['events'][number]['result']>;

export default function useStats(profile: Profile | undefined) {
  const countStats = useCallback(
    (filterFn: (result: Result) => boolean) => {
      if (!profile) return 0;
      const { events } = profile;
      const results = events
        .filter(event => event.result)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(event => event.result!);

      return results.filter(filterFn).length;
    },
    [profile]
  );

  const podiums = useMemo(() => {
    return countStats(result => {
      const { racePosition } = result;
      if (racePosition) return racePosition <= 3;
      return false;
    });
  }, [countStats]);

  const wins = useMemo(() => {
    return countStats(result => {
      const { racePosition } = result;
      if (racePosition) return racePosition === 1;
      return false;
    });
  }, [countStats]);

  const polePositions = useMemo(() => {
    return countStats(result => {
      const { qualiPosition } = result;
      if (qualiPosition) return qualiPosition === 1;
      return false;
    });
  }, [countStats]);

  const raceStarts = useMemo(
    () => countStats(result => !result.DNS),
    [countStats]
  );

  const DNFs = useMemo(() => countStats(result => result.DNF), [countStats]);

  return { wins, podiums, polePositions, raceStarts, DNFs };
}

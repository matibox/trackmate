import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { useMemo, type FC } from 'react';
import { useError } from '~/hooks/useError';
import cn from '~/lib/classes';
import { api } from '~/utils/api';
import { hasRole } from '~/utils/helpers';
import ChampResult from './ChampResult';
import ResultsHeader from './Header';
import Result from './Result';
import { useResultsStore } from './store';

const Results: FC = () => {
  const { data: session } = useSession();
  const {
    current,
    sorting: { activeSort },
    resultsType,
  } = useResultsStore();

  const { Error, setError } = useError();

  const { data: team, isInitialLoading: hasTeamLoading } =
    api.team.getHasTeam.useQuery(undefined, {
      enabled: Boolean(
        hasRole(session, 'manager') || hasRole(session, 'socialMedia')
      ),
      onError: err => setError(err.message),
    });

  const queryInput = useMemo(
    () => ({
      firstDay: new Date(current.year(), current.month(), 1),
      lastDay: new Date(current.year(), current.month(), current.daysInMonth()),
      teamId: team?.id,
      orderBy: activeSort,
    }),
    [activeSort, current, team?.id]
  );

  const { data: results, isInitialLoading: resultsLoading } =
    api.result.getResultPage.useQuery(queryInput, {
      enabled:
        Boolean(
          hasRole(session, 'manager') || hasRole(session, 'socialMedia')
        ) &&
        Boolean(team?.id) &&
        resultsType === 'regular',
    });
  const { data: champResults, isInitialLoading: champResultsLoading } =
    api.result.getChampResultPage.useQuery(queryInput, {
      enabled:
        Boolean(
          hasRole(session, 'manager') || hasRole(session, 'socialMedia')
        ) &&
        Boolean(team?.id) &&
        resultsType === 'championship',
    });

  const hideSorting = useMemo(() => {
    if (resultsType === 'regular') {
      return !results || results.length === 0;
    }
    return !champResults || champResults.length === 0;
  }, [champResults, results, resultsType]);

  if (!hasRole(session, 'manager') && !hasRole(session, 'socialMedia')) {
    return null;
  }

  return (
    <Tile
      header={<ResultsHeader noResults={hideSorting} />}
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 md:row-span-2 md:max-h-[800px] xl:col-span-2',
        {
          'md:col-span-2 lg:col-span-2 xl:col-span-3':
            hasRole(session, 'socialMedia') && !hasRole(session, 'manager'),
        }
      )}
      isLoading={hasTeamLoading || resultsLoading || champResultsLoading}
      fixedHeader
    >
      {!team && (
        <span className='text-lg text-slate-300'>
          Join a team to see team results
        </span>
      )}
      {resultsType === 'regular' ? (
        <>
          {!results ||
            (results && results.length === 0 && (
              <span className='text-lg text-slate-300'>
                No results for {current.format('MMMM YYYY')}
              </span>
            ))}
        </>
      ) : (
        <>
          {!champResults ||
            (champResults && champResults.length === 0 && (
              <span className='text-lg text-slate-300'>
                No championship results for {current.format('MMMM YYYY')}
              </span>
            ))}
        </>
      )}
      <div className='flex w-full flex-wrap gap-4'>
        {resultsType === 'regular' ? (
          <>
            {results?.map(result => (
              <Result key={result.id} result={result} />
            ))}
          </>
        ) : (
          <>
            {champResults?.map(result => (
              <ChampResult key={result.id} result={result} />
            ))}
          </>
        )}
      </div>
      <Error />
    </Tile>
  );
};

export default Results;

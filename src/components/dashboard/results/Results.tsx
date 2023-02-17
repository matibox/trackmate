import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import cn from '../../../lib/classes';
import { useTeamResultsStore } from '../../../store/useTeamResultsStore';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import ResultsHeader from './Header';
import Result from './Result';

const Results: FC = () => {
  const { data: session } = useSession();
  const {
    current,
    sorting: { activeSort },
  } = useTeamResultsStore();

  const { Error, setError } = useError();

  const { data: team, isInitialLoading: hasTeamLoading } =
    api.team.getHasTeam.useQuery(undefined, {
      enabled: Boolean(
        hasRole(session, 'manager') || hasRole(session, 'socialMedia')
      ),
      onError: err => setError(err.message),
    });
  const { data: results, isInitialLoading: resultsLoading } =
    api.result.getResultPage.useQuery(
      {
        firstDay: new Date(current.year(), current.month(), 1),
        lastDay: new Date(
          current.year(),
          current.month(),
          current.daysInMonth()
        ),
        teamId: team?.id,
        orderBy: activeSort,
      },
      {
        enabled:
          Boolean(
            hasRole(session, 'manager') || hasRole(session, 'socialMedia')
          ) && Boolean(team?.id),
      }
    );

  if (!hasRole(session, 'manager') && !hasRole(session, 'socialMedia')) {
    return null;
  }

  return (
    <Tile
      header={<ResultsHeader noResults={!results || results.length === 0} />}
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 md:row-span-2 md:max-h-[800px] xl:col-span-2',
        {
          'md:col-span-2 lg:col-span-2 xl:col-span-3':
            hasRole(session, 'socialMedia') && !hasRole(session, 'manager'),
        }
      )}
      isLoading={hasTeamLoading || resultsLoading}
      fixedHeader
    >
      {!team && (
        <span className='text-lg text-slate-300'>
          Join a team to see team results
        </span>
      )}
      {!results ||
        (results && results.length === 0 && (
          <span className='text-lg text-slate-300'>
            No results for {current.format('MMMM YYYY')}
          </span>
        ))}
      <div className='flex w-full flex-wrap gap-4'>
        {results?.map(result => (
          <Result key={result.id} result={result} />
        ))}
      </div>
      <Error />
    </Tile>
  );
};

export default Results;

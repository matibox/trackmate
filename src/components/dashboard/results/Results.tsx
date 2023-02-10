import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { type FC } from 'react';
import { useError } from '../../../hooks/useError';
import { useTeamResultsStore } from '../../../store/useTeamResultsStore';
import { api } from '../../../utils/api';
import { hasRole } from '../../../utils/helpers';
import ResultsHeader from './Header';
import Result from './Result';

const Results: FC = () => {
  const { data: session } = useSession();
  const { current } = useTeamResultsStore();

  const { Error, setError } = useError();

  const { data: team, isInitialLoading: hasTeamLoading } =
    api.team.getManagingFor.useQuery(undefined, {
      enabled: Boolean(hasRole(session, 'manager')),
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
      },
      {
        enabled: Boolean(hasRole(session, 'manager')) && Boolean(team?.id),
      }
    );

  if (!hasRole(session, 'manager')) return null;

  return (
    <Tile
      header={<ResultsHeader />}
      className='overflow-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400 md:row-span-2 md:max-h-[1100px] xl:col-span-2'
      isLoading={hasTeamLoading || resultsLoading}
      fixedHeader
    >
      {!team && (
        <span className='text-lg text-slate-300'>
          Manage a team to see team results
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

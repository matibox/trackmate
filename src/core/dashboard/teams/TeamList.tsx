import { useToast } from '~/components/ui/useToast';
import { type RouterOutputs, api } from '~/utils/api';
import Team from './Team';
import { Button } from '~/components/ui/Button';
import { useNewTeam } from './new-team/newTeamStore';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '~/components/ui/Skeleton';
import { type QueryStatus } from '@tanstack/react-query';
import { type TRPCError } from '@trpc/server';

export default function TeamList({
  data: teams,
  status,
  error,
  addTeamButton = false,
}: {
  data: RouterOutputs['team']['listMemberOf'] | undefined;
  status: QueryStatus;
  error: Omit<TRPCError, 'code' | 'name'> | null;
  addTeamButton?: boolean;
}) {
  // const [page, setPage] = useState(0);

  // const {
  //   data: teams,
  //   status,
  //   error,
  //   fetchNextPage,
  // } = api.team.get.useInfiniteQuery(
  //   {
  //     limit: 4,
  //   },
  //   {
  //     getNextPageParam: lastPage => lastPage.nextCursor,
  //   }
  // );

  // async function handleFetchNextPage() {
  //   await fetchNextPage();
  //   setPage(prev => prev + 1);
  // }

  // function handleFetchPrevPage() {
  //   setPage(prev => prev - 1);
  // }

  // const { data: teams, status, error } = api.team.listMemberOf.useQuery();
  const setNewTeamFormOpened = useNewTeam(s => s.setSheetOpened);
  const { toast } = useToast();

  if (status === 'loading') {
    return (
      <section className='grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,_417px)]'>
        {Array(2)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className='flex w-full items-center gap-4 rounded-md p-4 ring-1 ring-slate-800'
            >
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='flex flex-col gap-2'>
                <Skeleton className='h-3 w-40' />
                <div className='flex gap-2'>
                  {Array(2)
                    .fill(null)
                    .map((_, i) => (
                      <Skeleton key={i} className='h-5 w-10' />
                    ))}
                </div>
              </div>
            </div>
          ))}
      </section>
    );
  }

  if (status === 'error') {
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: error?.message,
    });

    return (
      <section className='flex w-full flex-col'>
        <p className='text-center text-slate-300 lg:text-left'>
          An error occured, try refreshing the page.
        </p>
      </section>
    );
  }

  return (
    <section>
      {teams?.length !== 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,_417px)]'>
          {teams?.map(team => (
            <Team key={team.id} team={team} />
          ))}
          {addTeamButton ? (
            <button
              className='flex min-h-[5rem] items-center justify-center rounded-md text-slate-300 ring-1 ring-slate-800'
              aria-label='New team'
              onClick={() => setNewTeamFormOpened(true)}
            >
              <PlusIcon />
            </button>
          ) : null}
        </div>
      ) : (
        <div className='flex flex-col items-center gap-1 text-slate-300'>
          <span>You have no teams.</span>
          <Button variant='ghost' onClick={() => setNewTeamFormOpened(true)}>
            Create a new team
          </Button>
        </div>
      )}
    </section>
  );
}

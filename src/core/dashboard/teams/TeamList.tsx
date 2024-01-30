import { useEffect } from 'react';
import { useToast } from '~/components/ui/useToast';
import { api } from '~/utils/api';
import Team from './Team';
import { Button } from '~/components/ui/Button';
import { useNewTeam } from './new-team/store/newTeamStore';

export default function TeamList() {
  const { data: teams, status, error } = api.team.list.useQuery();
  const setNewTeamFormOpened = useNewTeam(s => s.setSheetOpened);

  const { toast } = useToast();

  useEffect(() => {
    if (status !== 'error') return;
    toast({
      variant: 'destructive',
      title: 'An error occured',
      description: error.message,
    });
  }, [error?.message, status, toast]);

  if (status === 'loading') {
    return <section className='flex w-full flex-col'>TODO: skeleton</section>;
  }

  if (status === 'error') {
    return (
      <section className='flex w-full flex-col'>
        <p className='text-center text-slate-300 lg:text-left'>
          An error occured, try refreshing the page.
        </p>
      </section>
    );
  }

  return (
    <section className='flex w-full flex-col gap-4'>
      {teams.length > 0 ? (
        teams.map(team => <Team key={team.id} team={team} />)
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

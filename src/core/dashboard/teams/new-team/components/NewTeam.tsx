import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/Sheet';
import { useNewTeam } from '../store/newTeamStore';
import { Button } from '~/components/ui/Button';
import { PlusIcon } from 'lucide-react';

export default function NewTeam() {
  const { setSheetOpened, sheetOpened } = useNewTeam();

  return (
    <Sheet open={sheetOpened} onOpenChange={setSheetOpened}>
      <SheetTrigger asChild className='lg:hidden'>
        <Button
          variant='fab'
          size='fab'
          className='fixed bottom-24 right-4'
          aria-label='Create team'
        >
          <PlusIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full border-0 ring-1 ring-slate-900'>
        <span className='text-slate-50'>new team form</span>
      </SheetContent>
    </Sheet>
  );
}

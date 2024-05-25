import { FilterIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { useDebounce } from '~/hooks/useDebounce';

export default function Explore() {
  const [query, setQuery] = useState('');

  const router = useRouter();

  useDebounce(
    () => {
      void router.replace({
        query: { ...router.query, q: query },
      });
    },
    500,
    [query]
  );

  return (
    <>
      <div className='flex w-full gap-4 self-start'>
        <div className='relative grow sm:grow-0'>
          <Input
            type='text'
            placeholder='Search'
            className='h-9 w-full placeholder:text-sm placeholder:font-medium sm:w-64'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <SearchIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        </div>
        <Button variant='ghost' className='h-9 w-9 px-0'>
          <FilterIcon className='h-[18px] w-[18px] text-slate-50' />
        </Button>
      </div>
      {/* <TeamList /> */}
    </>
  );
}

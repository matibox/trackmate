import Tile from '@ui/Tile';
import dayjs from 'dayjs';
import { useMemo, type FC } from 'react';
import { type RouterOutputs } from '~/utils/api';
import DriverList from '~/components/common/DriverList';
import Details from '~/components/common/Details';

type ResultProps = {
  result: RouterOutputs['result']['getChampResultPage'][number];
};

const ChampResult: FC<ResultProps> = ({ result }) => {
  const champOccurence = useMemo(() => {
    const { events } = result.championship;

    const format = (date: Date | undefined) =>
      dayjs(date).format('YYYY MMM DD');

    return `${format(events[0]?.date)} - ${format(
      events[events.length - 1]?.date
    )}`;
  }, [result.championship]);

  return (
    <Tile
      header={
        <div className='flex w-full items-center justify-between'>
          <span
            className='truncate text-lg font-semibold text-amber-400'
            title={`${result.championship.organizer} - ${result.championship.name}`}
          >
            {result.championship.organizer} - {result.championship.name}
          </span>
        </div>
      }
      className='relative w-96'
    >
      <Details
        details={[
          { label: 'Created by', value: result.author.name ?? 'driver' },
          {
            label: 'Created at',
            value: dayjs(result.createdAt).format('DD MMM HH:mm'),
          },
          { label: 'Championship occurence', value: champOccurence },
          {
            label: 'Roster',
            value: <DriverList drivers={result.championship.drivers} />,
            span: 2,
          },
        ]}
        className='border-b border-slate-700 pb-4'
      />
      <div className='grid-cols-w grid gap-4 pt-4'>
        <h2 className='col-span-2 text-lg font-semibold'>Result</h2>
        <div className='flex flex-col'>
          <span className='text-slate-300'>Championship position</span>P
          {result.position}
        </div>
      </div>
    </Tile>
  );
};

export default ChampResult;

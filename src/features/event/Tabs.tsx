import { type FC } from 'react';
import cn from '~/lib/classes';
import { useEventStore as useDetailedEventStore } from './store';
import Tab from './Tab';
import Tile from '@ui/Tile';
import Details from '~/components/common/Details';
import dayjs from 'dayjs';
import EventDuration from '~/components/common/EventDuration';
import { capitilize } from '~/utils/helpers';
import Button from '@ui/Button';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEventStore } from '../dashboard/events/store';

const EventTabs: FC = () => {
  const { event, tabs, selectTab } = useDetailedEventStore();
  const {
    edit: { open: openEdit },
    delete: { open: openDelete },
  } = useEventStore();

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid max-w-lg grid-cols-[repeat(auto-fit,_minmax(115px,_1fr))] gap-1'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={cn(
              'rounded bg-slate-800 px-4 py-1 transition-colors focus:bg-slate-700 focus:outline-none hover:bg-slate-700',
              {
                'bg-sky-500 focus:bg-sky-400 focus:outline-none hover:bg-sky-500':
                  tab.selected,
              }
            )}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {event && (
        <>
          <Tab showedOn='information'>
            <div className='flex gap-4'>
              {/*// TODO: cant edit when event is over */}
              {/*// TODO: past / future event indication */}
              <div className='flex flex-col gap-2'>
                <Button
                  intent='secondary'
                  onClick={() => openEdit(event)}
                  disabled={!!event?.result}
                  title={!!event?.result ? "Can't edit ended event" : ''}
                >
                  <span>Edit event</span>
                  <PencilSquareIcon className='h-5' />
                </Button>
                <Button
                  intent='subtleDanger'
                  onClick={() => openDelete(event)}
                  disabled={!!event?.result}
                  title={!!event?.result ? "Can't edit ended event" : ''}
                >
                  <span>Delete event</span>
                  <TrashIcon className='h-5' />
                </Button>
              </div>
              <Tile className='grow'>
                <Details
                  details={[
                    {
                      label: 'Event occurence',
                      value: dayjs(event?.date).format('YYYY MMM DD'),
                    },
                    {
                      label: 'Duration',
                      value: <EventDuration duration={event?.duration} />,
                    },
                    {
                      label: 'Event type',
                      value: capitilize(event?.type),
                    },
                    {
                      label: 'Manager',
                      value: event?.manager?.name,
                      condition: !!event?.manager,
                    },
                    {
                      label: 'Car',
                      value: capitilize(event?.car),
                    },
                    {
                      label: 'Track',
                      value: capitilize(event?.track),
                    },
                  ]}
                />
              </Tile>
            </div>
          </Tab>
          <Tab showedOn='drivers'>drivers</Tab>
          <Tab showedOn='setups'>setups</Tab>
          <Tab showedOn='result'>result</Tab>
        </>
      )}
    </div>
  );
};

export default EventTabs;

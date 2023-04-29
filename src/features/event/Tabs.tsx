import { type FC } from 'react';
import cn from '~/lib/classes';
import Tab from './Tab';
import Information from './Information';
import { type Event } from '~/pages/event/[eventId]';
import { useEventTabsStore } from './store';
import Drivers from './Drivers';

const EventTabs: FC<{ event: Event }> = ({ event }) => {
  const { tabs, selectTab } = useEventTabsStore();

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid max-w-lg grid-cols-[repeat(auto-fit,_minmax(115px,_1fr))] gap-1'>
        {tabs.map(tab => {
          const hidden = tab.label === 'Stints' && event.type !== 'endurance';
          return !hidden ? (
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
          ) : null;
        })}
      </div>
      {event && (
        <>
          <Tab showedOn='information'>
            <Information event={event} />
          </Tab>
          <Tab showedOn='drivers'>
            <Drivers event={event} />
          </Tab>
          <Tab showedOn='setups'>setups</Tab>
          <Tab showedOn='stints'>stints</Tab>
        </>
      )}
    </div>
  );
};

export default EventTabs;

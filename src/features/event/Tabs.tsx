import { type FC } from 'react';
import cn from '~/lib/classes';
import Tab from './Tab';
import Information from './Information';
import { useEventTabsStore } from './store';
import Drivers from './Drivers';
import Setups from './Setups';
import Stints from './Stints';
import { useEventQuery } from './hooks/useEventQuery';

const EventTabs: FC = () => {
  const { tabs, selectTab } = useEventTabsStore();
  const event = useEventQuery();

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
      <Tab showedOn='information'>
        <Information />
      </Tab>
      <Tab showedOn='drivers'>
        <Drivers />
      </Tab>
      <Tab showedOn='setups'>
        <Setups />
      </Tab>
      <Tab showedOn='stints'>
        <Stints />
      </Tab>
    </div>
  );
};

export default EventTabs;

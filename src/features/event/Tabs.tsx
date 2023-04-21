import { type FC } from 'react';
import cn from '~/lib/classes';
import { useEventStore } from './store';
import Tab from './Tab';

const EventTabs: FC = () => {
  const { tabs, selectTab } = useEventStore();

  return (
    <>
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
      <div>
        <Tab showedOn='information'>information</Tab>
        <Tab showedOn='drivers'>drivers</Tab>
        <Tab showedOn='setups'>setups</Tab>
        <Tab showedOn='result'>result</Tab>
      </div>
    </>
  );
};

export default EventTabs;

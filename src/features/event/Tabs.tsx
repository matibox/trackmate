import { Tab } from '@headlessui/react';
import { Fragment, type FC } from 'react';
import cn from '~/lib/classes';

const EventTabs: FC = () => {
  return (
    <Tab.Group>
      <Tab.List>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button
              className={cn(
                'foucs:bg-slate-700 bg-slate-800 px-4 py-1 transition-colors first:rounded-l last:rounded-r focus:outline-none hover:bg-slate-700',
                {
                  'bg-sky-500 focus:bg-sky-400 focus:outline-none hover:bg-sky-500':
                    selected,
                }
              )}
            >
              Information
            </button>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button
              className={cn(
                'foucs:bg-slate-700 bg-slate-800 px-4 py-1 transition-colors first:rounded-l last:rounded-r focus:outline-none hover:bg-slate-700',
                {
                  'bg-sky-500 focus:bg-sky-400 focus:outline-none hover:bg-sky-500':
                    selected,
                }
              )}
            >
              Drivers
            </button>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button
              className={cn(
                'foucs:bg-slate-700 bg-slate-800 px-4 py-1 transition-colors first:rounded-l last:rounded-r focus:outline-none hover:bg-slate-700',
                {
                  'bg-sky-500 focus:bg-sky-400 focus:outline-none hover:bg-sky-500':
                    selected,
                }
              )}
            >
              Result
            </button>
          )}
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>Information stuff</Tab.Panel>
        <Tab.Panel>Driver cards</Tab.Panel>
        <Tab.Panel>Result stuff</Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default EventTabs;

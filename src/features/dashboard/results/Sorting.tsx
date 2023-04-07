import { useCallback, type FC } from 'react';
import { motion } from 'framer-motion';
import { splitAndCapitilize } from '~/utils/helpers';
import { resultsSortingOptions } from '~/constants/constants';
import cn from '~/lib/classes';
import { ArrowUpIcon } from '@heroicons/react/20/solid';
import { api } from '~/utils/api';
import { useResultsStore } from './store';

type By = (typeof resultsSortingOptions)[number];

const ResultsSorting: FC = () => {
  const { activeSort, setSort } = useResultsStore().sorting;

  const utils = api.useContext();

  const invalidate = useCallback(async () => {
    await utils.result.invalidate();
  }, [utils.result]);

  const toggleSortOrder = async (by: By) => {
    setSort(by, activeSort.order === 'asc' ? 'desc' : 'asc');
    await invalidate();
  };

  const handleSortChange = async (by: By) => {
    setSort(by, 'asc');
    await invalidate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className='absolute top-20 right-4 flex w-32 flex-col items-start gap-1 rounded  bg-slate-700 p-3 ring-1 ring-sky-600'
    >
      <span className='mb-1 font-semibold'>Sort results</span>
      {resultsSortingOptions.map(option => {
        const isActive = option === activeSort.by;
        return (
          <button
            key={option}
            className={cn('flex items-center gap-1', {
              'text-sky-400': isActive,
            })}
            onClick={
              isActive
                ? () => void toggleSortOrder(option)
                : () => void handleSortChange(option)
            }
          >
            <span>{splitAndCapitilize(option)}</span>
            {isActive && (
              <ArrowUpIcon
                className={cn('h-5 transition', {
                  'rotate-180': activeSort.order === 'desc',
                })}
              />
            )}
          </button>
        );
      })}
    </motion.div>
  );
};

export default ResultsSorting;

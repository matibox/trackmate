import { type FC } from 'react';
import { usePostFeedbackStore } from '../store';
import Popup, { PopupHeader } from '~/components/common/Popup';
import Button from '@ui/Button';
import Form from '@ui/Form';
import Label from '@ui/Label';
import Input from '@ui/Input';
import { Listbox } from '@headlessui/react';
import { cornerParts, steers } from '~/constants/constants';
import cn from '~/lib/classes';
import {
  CheckIcon,
  ChevronUpDownIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import Loading from '@ui/Loading';
import usePostFeedback from '../hooks/usePostFeedback';

const PostFeedback: FC = () => {
  const { isOpened, close, setupId } = usePostFeedbackStore();

  const {
    problems,
    addProblem,
    deleteProblem,
    updateProblem,
    Error,
    errors,
    handleSubmit,
    isLoading,
  } = usePostFeedback({ setupId });

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Post feedback' />}
      isLoading={isLoading}
    >
      <Form
        onSubmit={e => handleSubmit(e, { problems })}
        className='relative gap-0 sm:gap-0'
      >
        <div className='flex max-h-96 w-full flex-col gap-4 overflow-y-auto px-1 py-0.5 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'>
          {problems.map((problem, i) => (
            <div key={problem.id} className='flex w-full flex-col'>
              <div className='flex items-center gap-2'>
                <span className='text-base font-semibold sm:text-lg'>
                  Problem {i + 1}
                </span>
                <button
                  className='h-4'
                  aria-label='Delete problem'
                  title='Delete problem'
                  onClick={() => deleteProblem({ id: problem.id })}
                >
                  <TrashIcon className='h-4 text-red-500 transition-colors hover:text-red-400' />
                </button>
              </div>
              <div className='flex w-full flex-wrap gap-x-2 gap-y-1 sm:gap-x-4'>
                <Label label='Corner number'>
                  <Input
                    type='number'
                    min={1}
                    max={100}
                    value={problem.corner}
                    onChange={e =>
                      updateProblem({
                        id: problem.id,
                        property: 'corner',
                        value: parseInt(e.target.value),
                      })
                    }
                    error={errors?.problems}
                  />
                </Label>
                <Label label='Corner part' className='relative'>
                  <Listbox
                    value={problem.cornerPart}
                    onChange={e =>
                      updateProblem({
                        id: problem.id,
                        property: 'cornerPart',
                        value: e,
                      })
                    }
                  >
                    <Listbox.Button className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'>
                      <span>{problem.cornerPart}</span>
                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon
                          className='h-5 w-5 text-slate-900'
                          aria-hidden='true'
                        />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className='absolute top-16 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm'>
                      {cornerParts.map(cornerPart => (
                        <Listbox.Option
                          key={cornerPart}
                          value={cornerPart}
                          className={({ active }) =>
                            cn(
                              'relative cursor-default select-none py-2 pl-10 pr-4 text-slate-900',
                              {
                                'bg-sky-500 text-slate-50': active,
                              }
                            )
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {cornerPart}
                              </span>
                              {selected && (
                                <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900'>
                                  <CheckIcon
                                    className='h-5 w-5'
                                    aria-hidden='true'
                                  />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Listbox>
                </Label>
                <Label label='Steer' className='relative'>
                  <Listbox
                    value={problem.steer}
                    onChange={e =>
                      updateProblem({
                        id: problem.id,
                        property: 'steer',
                        value: e,
                      })
                    }
                  >
                    <Listbox.Button className='relative h-8 cursor-default rounded bg-slate-50 pl-2 text-left text-slate-900 focus:outline-none focus-visible:ring focus-visible:ring-sky-600 sm:text-sm'>
                      <span>{problem.steer}</span>
                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <ChevronUpDownIcon
                          className='h-5 w-5 text-slate-900'
                          aria-hidden='true'
                        />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className='absolute top-16 mt-1 max-h-60 w-full overflow-auto rounded bg-slate-50 py-1 text-base focus:outline-none sm:text-sm'>
                      {steers.map(steer => (
                        <Listbox.Option
                          key={steer}
                          value={steer}
                          className={({ active }) =>
                            cn(
                              'relative cursor-default select-none py-2 pl-10 pr-4 text-slate-900',
                              {
                                'bg-sky-500 text-slate-50': active,
                              }
                            )
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {steer}
                              </span>
                              {selected && (
                                <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900'>
                                  <CheckIcon
                                    className='h-5 w-5'
                                    aria-hidden='true'
                                  />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Listbox>
                </Label>
                <Label label='Notes' optional>
                  <Input
                    type='text'
                    maxLength={65535}
                    value={problem.notes ?? ''}
                    onChange={e =>
                      updateProblem({
                        id: problem.id,
                        property: 'notes',
                        value: e.target.value,
                      })
                    }
                    error={errors?.problems}
                  />
                </Label>
              </div>
            </div>
          ))}
          <Button
            intent='secondary'
            size='small'
            type='button'
            onClick={addProblem}
            className={cn('self-start', { 'mb-4': problems.length > 0 })}
          >
            Add new problem
          </Button>
        </div>
        {problems.length > 0 ? (
          <>
            <div className='sticky -bottom-6 left-0 flex w-full items-center border-t border-slate-600 bg-slate-800 px-1 pt-3'>
              <Button
                intent='primary'
                size='small'
                type='submit'
                gap={isLoading ? 'normal' : 'small'}
                disabled={isLoading}
              >
                <span>Submit</span>
                {isLoading ? <Loading /> : null}
              </Button>
            </div>
            <Error />
          </>
        ) : null}
      </Form>
    </Popup>
  );
};

export default PostFeedback;

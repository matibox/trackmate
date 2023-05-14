import { useState, type FC } from 'react';
import { usePostFeedbackStore } from '../store';
import Popup, { PopupHeader } from '~/components/common/Popup';
import Button from '@ui/Button';
import crypto from 'crypto';
import Form from '@ui/Form';
import Label from '@ui/Label';
import Input from '@ui/Input';
import useForm from '~/hooks/useForm';
import { z } from 'zod';
import { Listbox } from '@headlessui/react';
import { cornerParts, steers } from '~/constants/constants';
import cn from '~/lib/classes';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const problemSchema = z.object({
  id: z.string(),
  corner: z.number(),
  cornerPart: z.enum(cornerParts),
  steer: z.enum(steers),
  notes: z.string().optional(),
});

type Problem = z.infer<typeof problemSchema>;

const generateDefaultProblem = (): Problem => ({
  id: crypto.randomBytes(8).toString('hex'),
  corner: 1,
  cornerPart: 'entry',
  steer: 'oversteer',
});

const PostFeedback: FC = () => {
  const { isOpened, close, setupId } = usePostFeedbackStore();

  const [problems, setProblems] = useState<Problem[]>([]);

  function updateProblem<K extends keyof Omit<Problem, 'id'>>({
    id,
    property,
    value,
  }: {
    id: string;
    property: K;
    value: Omit<Problem, 'id'>[K];
  }) {
    setProblems(prev =>
      prev.map(problem => {
        if (problem.id === id) {
          return {
            ...problem,
            [property]: value,
          };
        }
        return problem;
      })
    );
  }

  const { errors, handleSubmit } = useForm(
    z.object({ problems: z.array(problemSchema) }),
    ({ problems }) => {
      console.log(problems);
    }
  );

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader close={close} title='Post feedback' />}
    >
      <Form onSubmit={e => handleSubmit(e, { problems })} className='relative'>
        <div className='mb-2 flex max-h-96 w-full flex-col gap-4 overflow-y-auto py-0.5 px-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-sky-500 hover:scrollbar-thumb-sky-400'>
          {problems.map((problem, i) => (
            <div key={problem.id} className='flex w-full flex-col'>
              <span className='text-base font-semibold sm:text-lg'>
                Problem {i + 1}
              </span>
              <div className='flex w-full flex-wrap gap-x-2 gap-y-1 sm:gap-x-4'>
                <Label label='Corner number'>
                  <Input
                    type='text'
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
                <Label label='Corner part'>
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
                <Label label='Steer'>
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
                    value={problem.notes}
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
            onClick={() =>
              setProblems(prev => [...prev, generateDefaultProblem()])
            }
            className='self-start'
          >
            Add new problem
          </Button>
        </div>
        <div className='absolute bottom-0 left-0 h-12 w-full border-t border-sky-600 bg-slate-800'>
          test
        </div>
      </Form>
    </Popup>
  );
};

export default PostFeedback;

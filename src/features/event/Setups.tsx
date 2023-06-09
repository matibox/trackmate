import { useState, type FC } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/20/solid';
import Button from '@ui/Button';
import { PlusIcon } from '@heroicons/react/20/solid';
import {
  useEventSetupAssignStore,
  useEventSetupFeedbackStore,
  usePostFeedbackStore,
} from './store';
import AssignSetup from './popups/AssignSetup';
import Setup from './components/Setup';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';
import Avatar from '~/components/common/Avatar';
import Link from 'next/link';
import { capitilize } from '~/utils/helpers';
import cn from '~/lib/classes';
import dayjs from 'dayjs';
import { useEventQuery } from './hooks/useEventQuery';

const Setups: FC = () => {
  const { data: session } = useSession();
  const event = useEventQuery();

  const { open: openSetupAssignment } = useEventSetupAssignStore();
  const { setup, isOpened: isFeedbackOpened } = useEventSetupFeedbackStore();
  const { open: openPostFeedback } = usePostFeedbackStore();

  const { Error, setError } = useError();
  const utils = api.useContext();

  const { data: feedback, isLoading: feedbackLoading } =
    api.setup.feedback.useQuery(
      { setupId: setup?.id },
      {
        onError: err => setError(err.message),
        enabled: !!setup?.id,
      }
    );

  const { mutate: requestFeedback, isLoading: requestFeedbackLoading } =
    api.setup.requestFeedback.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
      },
    });

  const [problemLoadingId, setProblemLoadingId] = useState<string | undefined>(
    undefined
  );
  const { mutate: toggleProblemResolved, isLoading: problemResolvedLoading } =
    api.setup.toggleProblemResolved.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
        await utils.setup.feedback.invalidate();
      },
      onMutate: ({ problemId }) => {
        setProblemLoadingId(problemId);
      },
      onSettled: () => {
        setProblemLoadingId(undefined);
      },
    });

  return (
    <>
      <AssignSetup />
      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='flex flex-col gap-4 md:basis-1/2 '>
          <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-semibold leading-none'>
              Assigned setups
            </h2>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1 text-sm text-sky-400'>
                <CheckCircleIcon className='h-5' />
                <span>Active setup</span>
              </div>
              <div className='flex items-center gap-1 text-sm text-amber-400'>
                <ExclamationCircleIcon className='h-5' />
                <span>Setup got updated after last download</span>
              </div>
            </div>
            <div className='grid grid-cols-[repeat(auto-fit,_min(100%,_20rem))] gap-4'>
              {event.setups.map(setup => (
                <Setup
                  key={setup.id}
                  setup={setup}
                  eventId={event.id}
                  isAssigned={true}
                  fullWidth
                  feedback
                />
              ))}
              {event.setups.length === 0 ? (
                <span className='text-slate-300'>
                  There are no assigned setups
                </span>
              ) : null}
            </div>
          </div>
          <Button
            intent='primary'
            size='small'
            gap='small'
            className='self-start'
            onClick={() => openSetupAssignment(event.id)}
          >
            <span>Assign setup</span>
            <PlusIcon className='h-5' />
          </Button>
        </div>
        <div className='flex flex-col gap-2 md:basis-1/2'>
          <h2 className='text-lg font-semibold leading-none'>Setup feedback</h2>
          {isFeedbackOpened && setup ? (
            <Tile isLoading={requestFeedbackLoading || feedbackLoading}>
              <div className='flex flex-col gap-4'>
                {feedback?.length === 0 ? (
                  <span className='text-slate-300'>
                    There is no feedback for this setup
                  </span>
                ) : (
                  feedback?.map(feedback => (
                    <div key={feedback.id} className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <Link
                          draggable={false}
                          href={`/profile/${feedback.user.id}`}
                          className='flex items-center gap-2 transition-colors hover:text-sky-400'
                        >
                          <Avatar
                            src={feedback.user.image ?? ''}
                            alt={`${
                              feedback.user.name ?? 'driver'
                            }'s profile picture`}
                            width={30}
                            height={30}
                            className='flex items-center justify-center rounded-full text-center text-sm ring-1 ring-slate-700'
                          />
                          <span className='font-semibold'>
                            {feedback.user.name}
                          </span>
                        </Link>
                        {feedback.problems.every(
                          problem => problem.resolved
                        ) ? (
                          <CheckCircleIcon
                            className='h-5 text-sky-400'
                            title='Every problem was resolved'
                          />
                        ) : null}
                        <span className='text-sm text-slate-300'>
                          {dayjs(feedback.createdAt).format('DD MMM HH:mm')}
                        </span>
                      </div>
                      {feedback.generalFeedback ? (
                        <p className='mb-2'>{feedback.generalFeedback}</p>
                      ) : null}
                      <div className='flex flex-wrap gap-4'>
                        {feedback.problems.map(problem => (
                          <Tile
                            key={problem.id}
                            className='w-full sm:max-w-xs'
                            isLoading={
                              problemLoadingId === problem.id &&
                              problemResolvedLoading
                            }
                          >
                            <div className='flex flex-col'>
                              <span
                                className={cn('block font-semibold', {
                                  'text-slate-400': problem.resolved,
                                })}
                              >
                                {`${capitilize(problem.steer)} at turn ${
                                  problem.corner
                                } ${problem.cornerPart}`}
                              </span>
                              {problem.notes ? (
                                <span
                                  className={cn('block text-slate-300', {
                                    'text-slate-500': problem.resolved,
                                  })}
                                >
                                  {capitilize(problem.notes)}
                                </span>
                              ) : null}
                              {setup.author.id === session?.user?.id ? (
                                <Button
                                  intent='secondary'
                                  size='small'
                                  gap='small'
                                  className='mt-2'
                                  onClick={() =>
                                    toggleProblemResolved({
                                      problemId: problem.id,
                                      markAsResolved: !problem.resolved,
                                    })
                                  }
                                >
                                  Mark as {problem.resolved ? 'Un' : ''}
                                  resolved
                                </Button>
                              ) : null}
                            </div>
                          </Tile>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div className='flex gap-2'>
                  {setup.author.id === session?.user?.id ? (
                    <Button
                      intent='secondary'
                      size='small'
                      className='self-start'
                      onClick={() => {
                        requestFeedback({
                          reviewers: event.drivers.map(driver => ({
                            id: driver.id,
                          })),
                          setup: {
                            id: setup.id,
                            name: setup.name,
                          },
                        });
                      }}
                    >
                      <span>Request feedback</span>
                      <ChatBubbleLeftRightIcon className='h-4' />
                    </Button>
                  ) : (
                    <Button
                      intent='primary'
                      size='small'
                      className='self-start'
                      onClick={() => openPostFeedback(setup.id)}
                    >
                      <span>Post feedback</span>
                      <ChatBubbleBottomCenterTextIcon className='h-4' />
                    </Button>
                  )}
                </div>
              </div>
              <Error />
            </Tile>
          ) : (
            <span className='text-slate-300'>
              Click on the chat icon on the setup to open it&apos;s feedback
              window
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Setups;

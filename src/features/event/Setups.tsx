import { type FC } from 'react';
import { type Event } from '~/pages/event/[eventId]';
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
import { useEventSetupAssignStore, useEventSetupFeedbackStore } from './store';
import AssignSetup from './popups/AssignSetup';
import Setup from './components/Setup';
import Tile from '@ui/Tile';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { useError } from '~/hooks/useError';

const Setups: FC<{ event: Event }> = ({ event }) => {
  const { data: session } = useSession();

  const { open: openSetupAssignment } = useEventSetupAssignStore();
  const { setup, isOpened: isFeedbackOpened } = useEventSetupFeedbackStore();

  const { Error, setError } = useError();
  const utils = api.useContext();

  const { mutate: requestFeedback, isLoading } =
    api.setup.requestFeedback.useMutation({
      onError: err => setError(err.message),
      onSuccess: async () => {
        await utils.event.single.invalidate();
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
            <Tile isLoading={isLoading}>
              <div className='flex flex-col gap-4'>
                {setup.feedback.length === 0 ? (
                  <span className='text-slate-300'>
                    There is no feedback for this setup
                  </span>
                ) : null}
                <div className='flex gap-2'>
                  <Button intent='primary' size='small' className='self-start'>
                    <span>Post feedback</span>
                    <ChatBubbleBottomCenterTextIcon className='h-4' />
                  </Button>
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
                  ) : null}
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

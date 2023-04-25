import { useState, type FC, useRef } from 'react';
import { useEventStore } from '../dashboard/events/store';
import { useError } from '~/hooks/useError';
import { api } from '~/utils/api';
import useForm from '~/hooks/useForm';
import { z } from 'zod';
import cn from '~/lib/classes';
import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Button from '@ui/Button';
import Tile from '@ui/Tile';
import Details from '~/components/common/Details';
import Input from '@ui/Input';
import { capitilize } from '~/utils/helpers';
import dayjs from 'dayjs';
import EventDuration from '~/components/common/EventDuration';
import { Event } from '~/pages/event/[eventId]';
import { useRouter } from 'next/router';

const Information: FC<{ event: Event }> = ({ event }) => {
  const router = useRouter();
  const {
    delete: { open: openDelete, setAdditionalActions },
  } = useEventStore();
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const carRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLInputElement>(null);

  const { Error, setError } = useError();
  const utils = api.useContext();
  const { mutate: editEvent, isLoading } = api.event.edit.useMutation({
    onError: err => setError(err.message),
    onSuccess: async () => {
      await utils.event.invalidate();
      setIsEditing(false);
    },
  });

  const { handleSubmit, errors } = useForm(
    z.object({
      car: z.string().min(1, 'Car is required'),
      track: z.string().min(1, 'Track is required'),
      duration: z
        .number({ invalid_type_error: 'Duration is required' })
        .min(0, 'Duration needs to be a valid number'),
    }),
    values => {
      editEvent({
        id: event.id,
        ...values,
      });
    }
  );

  return (
    <div className='flex gap-4'>
      {/*// TODO: past / future event indication */}
      {/*// ? mini calendar on the side on pc view */}
      <div className='flex w-48 flex-col gap-2'>
        <Button
          intent='secondary'
          onClick={() => {
            if (isEditing) {
              formRef.current?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            } else {
              setIsEditing(true);
            }
          }}
          disabled={!!event?.result}
          title={!!event?.result ? "Can't edit ended event" : ''}
          className={cn({
            'ring-sky-500 hover:ring-sky-400': isEditing,
          })}
        >
          {isEditing ? (
            <>
              <span>Save changes</span>
              <ClipboardDocumentCheckIcon className='h-5' />
            </>
          ) : (
            <>
              <span>Edit event</span>
              <PencilSquareIcon className='h-5' />
            </>
          )}
        </Button>
        {isEditing && (
          <Button
            intent='secondary'
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            <span>Cancel changes</span>
            <XMarkIcon className='h-5' />
          </Button>
        )}
        <Button
          intent='subtleDanger'
          onClick={() => {
            setAdditionalActions(async () => {
              await router.push('/');
            });
            openDelete(event);
          }}
          disabled={!!event?.result || isEditing}
          title={!!event?.result ? "Can't delete ended event" : ''}
        >
          <span>Delete event</span>
          <TrashIcon className='h-5' />
        </Button>
      </div>
      <Tile
        className={cn('grow', {
          'ring-sky-500': isEditing,
        })}
        isLoading={isLoading}
      >
        {isEditing ? (
          <form
            ref={formRef}
            onSubmit={e =>
              handleSubmit(e, {
                car: carRef.current?.value,
                track: trackRef.current?.value,
                duration: parseInt(durationRef.current?.value as string),
              })
            }
          >
            <Details
              details={[
                {
                  label: 'Event occurence',
                  value: dayjs(event?.date).format('YYYY MMM DD'),
                },
                {
                  label: 'Duration (in minutes)',
                  value: (
                    <Input
                      defaultValue={event.duration}
                      error={errors?.duration}
                      ref={durationRef}
                      className='max-w-xs'
                    />
                  ),
                },
                {
                  label: 'Event type',
                  value: capitilize(event.type),
                },
                {
                  label: 'Manager',
                  value: event?.manager?.name,
                  condition: !!event?.manager,
                },
                {
                  label: 'Car',
                  value: (
                    <Input
                      defaultValue={event.car}
                      error={errors?.car}
                      ref={carRef}
                      className='max-w-xs'
                    />
                  ),
                },
                {
                  label: 'Track',
                  value: (
                    <Input
                      defaultValue={event.track}
                      error={errors?.track}
                      ref={trackRef}
                      className='max-w-xs'
                    />
                  ),
                },
              ]}
            />
          </form>
        ) : (
          <Details
            details={[
              {
                label: 'Event occurence',
                value: dayjs(event?.date).format('YYYY MMM DD'),
              },
              {
                label: 'Duration',
                value: <EventDuration duration={event.duration} />,
              },
              {
                label: 'Event type',
                value: capitilize(event.type),
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
        )}
        <Error />
      </Tile>
    </div>
  );
};

export default Information;

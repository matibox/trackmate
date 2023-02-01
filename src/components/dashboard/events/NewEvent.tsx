import { type FormEvent, type FC, useEffect } from 'react';
import { useNewEventStore } from '../../../store/useNewEventStore';
import Popup from '@ui/Popup';
import PopupHeader from '@ui/PopupHeader';
import Button from '@ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { useMultistepForm } from './useMultistepForm';
import NewEventType from './NewEventType';
import { z } from 'zod';
import Form from '@ui/Form';
import ChampEventDetails from './ChampEventDetails';
import OneOffEventDetails from './OneOffEventDetails';

export const formSchema = z.object({
  championshipId: z.string().optional(),
  newEventType: z.enum(['oneOff', 'championship']),
});

const NewEvent: FC = () => {
  const { close, isOpened, formState, setErrors } = useNewEventStore();

  const steps = [
    <NewEventType key={0} />,
    <>
      {formState.newEventType === 'championship' ? (
        <ChampEventDetails />
      ) : (
        <OneOffEventDetails />
      )}
    </>,
  ];

  const { errors, handleSubmit, prev, next, step, isFirst, isLast } =
    useMultistepForm(steps, formSchema, values => {
      console.log(values);
    });

  useEffect(() => {
    setErrors(errors);
  }, [errors, setErrors]);

  function handlePrevStep() {
    if (!isFirst) return prev();
  }

  function handleNextStep(e: FormEvent) {
    e.preventDefault();
    if (!isLast) return next();
    handleSubmit(e, formState);
  }

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={<PopupHeader title='new event' close={close} />}
      className='max-w-3xl'
    >
      <Form className='flex flex-col gap-4' onSubmit={handleNextStep}>
        {step}
        <div className='flex w-full justify-between'>
          <Button
            intent='primary'
            size='small'
            gap='small'
            className='self-end'
            type='button'
            onClick={handlePrevStep}
            disabled={isFirst}
          >
            <ArrowLeftIcon className='h-5' />
            <span>Prev</span>
          </Button>
          <Button
            intent='primary'
            size='small'
            gap='small'
            className='self-end'
            type='submit'
          >
            <span>{isLast ? 'Submit' : 'Next'}</span>
            <ArrowRightIcon className='h-5' />
          </Button>
        </div>
      </Form>
    </Popup>
  );
};

export default NewEvent;

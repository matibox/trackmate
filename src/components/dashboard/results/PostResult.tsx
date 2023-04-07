import Button from '@ui/Button';
import Form from '@ui/Form';
import Input from '@ui/Input';
import Label from '@ui/Label';
import Popup, { PopupHeader } from '~/components/common/Popup';
import { useMemo, useState, type FC } from 'react';
import { z } from 'zod';
import { useError } from '../../../hooks/useError';
import useForm from '../../../hooks/useForm';
import { useResultStore } from '../../../store/useResultStore';
import { api } from '../../../utils/api';
import ErrorWrapper from '../../ErrorWrapper';

const formSchema = z
  .object({
    qualiPosition: z.string(),
    racePosition: z.string(),
    notes: z.string().optional(),
    DNF: z.boolean(),
    DNS: z.boolean(),
    DSQ: z.boolean(),
  })
  .superRefine(({ qualiPosition, racePosition, DNF, DNS, DSQ }, ctx) => {
    if (DNF || DNS || DSQ) return;

    if (!qualiPosition) {
      ctx.addIssue({
        code: 'too_small',
        minimum: 1,
        inclusive: true,
        type: 'string',
        message: 'Qualifying position is required',
        path: ['qualiPosition'],
      });
    }

    if (!racePosition) {
      ctx.addIssue({
        code: 'too_small',
        minimum: 1,
        inclusive: true,
        type: 'string',
        message: 'Race position is required',
        path: ['racePosition'],
      });
    }
  });

type FormSchema = z.infer<typeof formSchema>;

const defaultFormState: FormSchema = {
  qualiPosition: '1',
  racePosition: '1',
  notes: '',
  DNF: false,
  DNS: false,
  DSQ: false,
};

const PostResult: FC = () => {
  const { isOpened, close, event } = useResultStore();

  const [formState, setFormState] = useState<FormSchema>(defaultFormState);
  const Dxx = useMemo(() => {
    const { DNF, DNS, DSQ } = formState;
    return DNF || DNS || DSQ;
  }, [formState]);

  const { Error, setError } = useError();
  const { handleSubmit, errors } = useForm(formSchema, values => {
    const results = {
      qualiPosition: parseInt(values.qualiPosition),
      racePosition: parseInt(values.racePosition),
    };
    if (Dxx) {
      postResult({
        ...values,
        ...results,
        qualiPosition: null,
        racePosition: null,
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eventId: event!.id,
      });
    } else {
      postResult({
        ...values,
        ...results,
        //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eventId: event!.id,
      });
    }
  });

  const utils = api.useContext();
  const { mutate: postResult, isLoading } = api.result.post.useMutation({
    async onSuccess() {
      close();
      setFormState(defaultFormState);
      await utils.event.invalidate();
      await utils.championship.get.invalidate();
      await utils.result.getResultPage.invalidate();
    },
    onError: err => setError(err.message),
  });

  return (
    <Popup
      header={
        <PopupHeader
          close={close}
          title={`Post result for ${event?.title ?? ''}`}
        />
      }
      close={close}
      condition={isOpened}
      isLoading={isLoading}
    >
      <Form onSubmit={e => handleSubmit(e, formState)}>
        <div className='flex w-full flex-wrap justify-start gap-1'>
          <ErrorWrapper error={errors?.DNF}>
            <Label
              label='DNF'
              className='flex flex-1 flex-row items-center gap-2'
              optional
            >
              <input
                id='DNF'
                type='checkbox'
                checked={formState.DNF}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    DNS: false,
                    DSQ: false,
                    DNF: e.target.checked,
                  }))
                }
                className='mr-2 h-4 w-4 rounded accent-sky-500'
              />
            </Label>
          </ErrorWrapper>
          <ErrorWrapper error={errors?.DNS}>
            <Label
              label='DNS'
              className='flex flex-1 flex-row items-center gap-2'
              optional
            >
              <input
                id='DNS'
                type='checkbox'
                checked={formState.DNS}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    DSQ: false,
                    DNF: false,
                    DNS: e.target.checked,
                  }))
                }
                className='mr-2 h-4 w-4 rounded accent-sky-500'
              />
            </Label>
          </ErrorWrapper>
          <ErrorWrapper error={errors?.DSQ}>
            <Label
              label='DSQ'
              className='flex flex-1 flex-row items-center gap-2'
              optional
            >
              <input
                id='DSQ'
                type='checkbox'
                checked={formState.DSQ}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    DNF: false,
                    DNS: false,
                    DSQ: e.target.checked,
                  }))
                }
                className='mr-2 h-4 w-4 rounded accent-sky-500'
              />
            </Label>
          </ErrorWrapper>
        </div>
        {!Dxx && (
          <>
            <Label label='qualifying position'>
              <Input
                type='number'
                min={1}
                max={255}
                value={formState.qualiPosition}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    qualiPosition: e.target.value,
                  }))
                }
                error={errors?.qualiPosition}
              />
            </Label>
            <Label label='race position'>
              <Input
                type='number'
                min={1}
                max={255}
                value={formState.racePosition}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    racePosition: e.target.value,
                  }))
                }
                error={errors?.racePosition}
              />
            </Label>
          </>
        )}
        <Label label='notes' optional className='sm:w-full'>
          <textarea
            className='h-24 w-full resize-none appearance-none rounded px-2 py-1 tracking-tight text-slate-900 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 selection:bg-sky-500 selection:text-slate-50 focus:outline-none focus:ring focus:ring-sky-600'
            maxLength={65535}
            value={formState.notes}
            onChange={e =>
              setFormState(prev => ({
                ...prev,
                notes: e.target.value,
              }))
            }
          ></textarea>
        </Label>
        <Error />
        <Button intent='primary' size='small' className='ml-auto'>
          Submit
        </Button>
      </Form>
    </Popup>
  );
};

export default PostResult;

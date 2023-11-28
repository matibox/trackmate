import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { cars, games, tracks } from '~/lib/constants';
import { Button } from '~/components/ui/Button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import { type ReplaceAll, groupBy } from '~/lib/utils';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import { useNewEvent } from '../store/newEventStore';
import { type $Enums } from '@prisma/client';
import { useEffect } from 'react';
import Flag from '~/components/Flag';
import { useFirstRender } from '~/hooks/useFirstRender';

const baseSchemaShape = z.object({
  name: z
    .string({ required_error: 'Event name is required.' })
    .min(1, 'Event name is required.'),
});

const trackErrorMessage = 'Track is required.';
const carErrorMessage = 'Car is required.';

export const step2SingleSchema = z
  .discriminatedUnion('game', [
    // ACC
    z.object({
      game: z.literal('Assetto Corsa Competizione'),
      car: z
        .string({ required_error: carErrorMessage })
        .min(1, carErrorMessage),
      track: z
        .string({ required_error: trackErrorMessage })
        .min(1, trackErrorMessage),
    }),
    // F1
    z.object({
      game: z.literal('F1 23'),
      track: z
        .string({ required_error: trackErrorMessage })
        .min(1, trackErrorMessage),
      car: z
        .string({ required_error: carErrorMessage })
        .min(1, trackErrorMessage),
    }),
  ])
  .and(baseSchemaShape);

export default function Step2Single() {
  const { data: session } = useSession();
  const {
    setStep,
    setData,
    steps: { stepTwoSingle },
  } = useNewEvent();

  const firstRender = useFirstRender();

  const form = useForm<z.infer<typeof step2SingleSchema>>({
    resolver: zodResolver(step2SingleSchema),
    defaultValues: {
      name: stepTwoSingle?.name ?? '',
      game: stepTwoSingle
        ? stepTwoSingle.game
        : (session?.user.profile?.mainGame.replaceAll('_', ' ') as ReplaceAll<
            $Enums.Game,
            '_',
            ' '
          >),
      car: stepTwoSingle
        ? 'car' in stepTwoSingle
          ? stepTwoSingle.car
          : undefined
        : undefined,
      track: stepTwoSingle
        ? 'track' in stepTwoSingle
          ? stepTwoSingle.track
          : undefined
        : undefined,
    },
  });

  function onSubmit(values: z.infer<typeof step2SingleSchema>) {
    setData({ step: '2-single', data: values });
    setStep('3-single');
  }

  const game = form.watch('game');

  useEffect(() => {
    if (firstRender) return;
    form.resetField('car', { defaultValue: '' });
    form.resetField('track', { defaultValue: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, game, setData]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create single event</SheetTitle>
        <SheetDescription>
          Fill basic event data, click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid justify-center gap-4 py-8 text-slate-50'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event name</FormLabel>
                  <FormControl className='w-[278px]'>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='game'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Game</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select main game' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {games.map(game => (
                        <SelectItem key={game} value={game}>
                          {game}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {['Assetto Corsa Competizione', 'F1 23'].includes(game) ? (
              <>
                <FormField
                  control={form.control}
                  name='track'
                  render={({ field }) => {
                    const currentGame = form.getValues('game');
                    const gameTracks = tracks[currentGame];

                    return (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Track</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a track' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-96'>
                            {gameTracks.map(track => (
                              <SelectItem key={track.name} value={track.name}>
                                <div className='flex items-center gap-2'>
                                  <Flag country={track.country} />
                                  <span>{track.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name='car'
                  render={({ field }) => {
                    const currentGame = form.getValues('game');

                    const groupedCars = groupBy(
                      [...cars[currentGame]],
                      i => i.type
                    );

                    return (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Car</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a car' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-96'>
                            {Object.entries(groupedCars).map(
                              ([groupName, cars]) => (
                                <SelectGroup
                                  key={groupName}
                                  className='border-b border-slate-800 pb-2 pt-2 first:pt-0 last:border-b-0 last:pb-0'
                                >
                                  <SelectLabel>{groupName}</SelectLabel>
                                  {cars.map(car => (
                                    <SelectItem key={car.name} value={car.name}>
                                      {car.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </>
            ) : null}
            <SheetFooter className='flex-row justify-between sm:justify-between'>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  const data = form.getValues();
                  setData({
                    step: '2-single',
                    data,
                  });
                  setStep('1');
                }}
              >
                Back
              </Button>
              <Button type='submit'>Next</Button>
            </SheetFooter>
          </div>
        </form>
      </Form>
    </>
  );
}

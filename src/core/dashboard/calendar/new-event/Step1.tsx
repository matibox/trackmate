import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import Flag from '~/components/Flag';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/Sheet';
import { cars, games, tracks } from '~/lib/constants';
import { groupBy } from '~/lib/utils';

export const stepOneSchema = z.object({
  name: z
    .string({ required_error: 'Event name is required.' })
    .min(1, 'Event name is requred.'),
  game: z.enum(games, { required_error: 'Game is required.' }),
  track: z
    .string({ required_error: 'Track is required.' })
    .min(1, 'Track is required.'),
  car: z
    .string({ required_error: 'Car is required.' })
    .min(1, 'Car is required.'),
});

export default function StepOne() {
  const form = useFormContext<z.infer<typeof stepOneSchema>>();

  return (
    <>
      <SheetHeader>
        <SheetTitle className='text-3xl'>Create an event</SheetTitle>
        <SheetDescription>
          Fill basic event data, click next when you&apos;re ready.
        </SheetDescription>
      </SheetHeader>
      <div className='mx-auto flex w-4/5 flex-col gap-4 py-8 text-slate-50'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event name</FormLabel>
              <FormControl>
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
              <Select
                onValueChange={e => {
                  field.onChange(e);
                  form.resetField('track', { defaultValue: '' });
                  form.resetField('car', { defaultValue: '' });
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select game' />
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
        <FormField
          control={form.control}
          name='track'
          render={({ field }) =>
            form.watch('game') ? (
              <FormItem className='flex flex-col'>
                <FormLabel>Track</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a track' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='max-h-96'>
                    {tracks[form.getValues('game')]?.map(
                      ({ name, country }) => (
                        <SelectItem key={name} value={name}>
                          <div className='flex items-center gap-2'>
                            <Flag country={country} />
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            ) : (
              <></>
            )
          }
        />
        <FormField
          control={form.control}
          name='car'
          render={({ field }) =>
            form.watch('game') ? (
              <FormItem className='flex flex-col'>
                <FormLabel>Car</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a car' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='max-h-96'>
                    {Object.entries(
                      groupBy(
                        [...cars[form.getValues('game')]],
                        car => car.type
                      )
                    ).map(([groupName, cars]) => (
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
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            ) : (
              <></>
            )
          }
        />
      </div>
    </>
  );
}

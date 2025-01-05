'use client';

import { z } from 'zod';
import { cars, games, tracks } from '~/lib/constants';
import Step from './Step';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import Flag from '~/components/Flag';
import { cn, groupBy } from '~/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import dayjs from '~/lib/dates';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '~/components/ui/calendar';

export const stepOneSchema = z.object({
  date: z.date({ required_error: 'Event date is required.' }),
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

export default function Step1({ editMode = false }: { editMode?: boolean }) {
  const form = useFormContext<z.infer<typeof stepOneSchema>>();

  return (
    <Step
      title={`${editMode ? 'Edit' : 'Create'} an event`}
      description="Fill basic event data, click next when you're ready."
    >
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Event date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      dayjs(field.value).format('MMMM DD, YYYY')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event name</FormLabel>
            <FormControl>
              <Input {...field} autoFocus autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="game"
        render={({ field }) => (
          <FormItem className="flex flex-col">
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
                  <SelectValue placeholder="Select game" />
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
        name="track"
        render={({ field }) =>
          form.watch('game') ? (
            <FormItem className="flex flex-col">
              <FormLabel>Track</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a track" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-96">
                  {tracks[form.getValues('game')].map(({ name, country }) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <Flag country={country} />
                        <span>{name}</span>
                      </div>
                    </SelectItem>
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
      <FormField
        control={form.control}
        name="car"
        render={({ field }) =>
          form.watch('game') ? (
            <FormItem className="flex flex-col">
              <FormLabel>Car</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a car" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-96">
                  {Object.entries(
                    groupBy([...cars[form.getValues('game')]], car => car.type)
                  ).map(([groupName, cars]) => (
                    <SelectGroup
                      key={groupName}
                      className="border-b border-slate-800 pb-2 pt-2 first:pt-0 last:border-b-0 last:pb-0"
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
    </Step>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import ResponsiveDialog from '~/components/ui/responsive-dialog';
import { uploadTelemetrySchema } from './formSchema';
import { type z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { cars, games, tracks } from '~/lib/constants';
import Flag from '~/components/Flag';
import { groupBy } from '~/lib/utils';

export default function TelemetryUpload() {
  const router = useRouter();

  const form = useForm<z.infer<typeof uploadTelemetrySchema>>({
    resolver: zodResolver(uploadTelemetrySchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof uploadTelemetrySchema>) {
    console.log(values);
  }

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={open => {
        if (!open) router.back();
      }}
      title="Upload telemetry"
      description="Store your data in one place with ease."
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
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
                      {tracks[form.getValues('game')].map(
                        ({ name, country }) => (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
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
                        groupBy(
                          [...cars[form.getValues('game')]],
                          car => car.type
                        )
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
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telemetry File (.zip)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="self-end"
            // loading={createTeam.status === 'pending'}
          >
            Submit
          </Button>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}

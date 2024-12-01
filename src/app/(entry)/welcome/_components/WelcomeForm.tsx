'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { cn } from '~/lib/utils';
import { countries } from '~/lib/constants';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import Flag from '~/components/Flag';
import { api } from '~/trpc/react';
import { type WelcomeFormSchema, welcomeFormSchema } from './formSchema';

export default function WelcomeForm() {
  const form = useForm<WelcomeFormSchema>({
    resolver: zodResolver(welcomeFormSchema),
    defaultValues: { firstName: '', lastName: '' },
  });

  const createProfile = api.profile.create.useMutation({
    onSuccess: () => {
      console.log('success');
    },
  });

  function onSubmit(values: WelcomeFormSchema) {
    createProfile.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-end gap-4"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel>Country</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        <div className="flex items-center gap-1.5">
                          <Flag
                            country={countries.find(
                              country => country === field.value
                            )}
                          />
                          {countries.find(country => country === field.value)}
                        </div>
                      ) : (
                        'Select country'
                      )}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[215px] p-0">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandList>
                      <CommandEmpty>No countries found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map(country => (
                          <CommandItem
                            value={country}
                            key={country}
                            onSelect={() => {
                              form.setValue('country', country);
                            }}
                          >
                            <Flag country={country} />
                            {country}
                            <CheckIcon
                              className={cn(
                                'ml-auto',
                                country === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Finish</Button>
      </form>
    </Form>
  );
}

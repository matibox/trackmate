import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Button } from '~/components/ui/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWelcomeForm } from '../store/formStore';
import { countries, games } from '~/lib/constants';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import { cn } from '~/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/ui/Command';
import WelcomeLayout from './Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/Select';
import { Textarea } from '~/components/ui/Textarea';

const formSchema = z.object({
  country: z.string({ required_error: 'Please select a country.' }),
  mainGame: z.string({ required_error: 'Please select a main game.' }),
  bio: z
    .string()
    .max(160, { message: "Bio can't be longer than 160 characters." })
    .optional(),
});

export default function StepOne() {
  const nextStep = useWelcomeForm(state => state.nextStep);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    nextStep();
  }

  return (
    <WelcomeLayout
      title='Customize your profile'
      description='Information below will be shown on your profile page. You can always change this in settings later.'
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full max-w-sm space-y-5'
        >
          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Country</FormLabel>
                <Popover>
                  <PopoverTrigger asChild className='px-3'>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? countries.find(country => country === field.value)
                          : 'Select country'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='p-0'>
                    <Command>
                      <CommandInput placeholder='Search country...' />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map(country => (
                          <CommandItem
                            value={country}
                            key={country}
                            onSelect={() => {
                              form.setValue('country', country);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                country === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='mainGame'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Main game</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Continue</Button>
        </form>
      </Form>
    </WelcomeLayout>
  );
}

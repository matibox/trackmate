import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Input } from '~/components/ui/Input';
import { games } from '~/lib/constants';

export const stepOneSchema = z.object({
  name: z.string().min(1, 'Event name is required.'),
  game: z.enum(games),
  track: z.string().min(1, 'Track is required.'),
  car: z.string().min(1, 'Car is required.'),
});

export default function StepOne() {
  const form = useFormContext<z.infer<typeof stepOneSchema>>();

  return (
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
    </div>
  );
}

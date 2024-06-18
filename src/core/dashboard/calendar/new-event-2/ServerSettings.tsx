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

export const serverInfoSchema = z.object({
  inGameTime: z.string().optional(),
  serverName: z.string().optional(),
  serverPassword: z.string().optional(),
});

export const serverSettingsDefaultValues: z.infer<typeof serverInfoSchema> = {
  inGameTime: '',
  serverName: '',
  serverPassword: '',
};

export default function ServerSettings() {
  const { control } = useFormContext<z.infer<typeof serverInfoSchema>>();

  return (
    <>
      <FormField
        control={control}
        name='inGameTime'
        render={({ field }) => (
          <FormItem>
            <FormLabel>In-game time</FormLabel>
            <FormControl>
              <Input {...field} type='time' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='serverName'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Server name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='serverPassword'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Server password</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

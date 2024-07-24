import { AlertTriangleIcon, ServerIcon } from 'lucide-react';
import { useMemo } from 'react';
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

export const serverSettingsDefaultValues: Partial<
  z.infer<typeof serverInfoSchema>
> = {
  inGameTime: '',
  serverName: '',
  serverPassword: '',
};

function ServerSettingsContent() {
  const form = useFormContext<z.infer<typeof serverInfoSchema>>();

  return (
    <div className='flex flex-col gap-4'>
      <FormField
        control={form.control}
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
        control={form.control}
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
        control={form.control}
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
    </div>
  );
}

function ServerSettingsTrigger() {
  const form = useFormContext<z.infer<typeof serverInfoSchema>>();
  const errors = form.formState.errors;

  const isError = useMemo(
    () => errors.inGameTime || errors.serverName || errors.serverPassword,
    [errors]
  );

  return (
    <>
      {isError ? (
        <AlertTriangleIcon className='h-4 w-4 text-red-500' />
      ) : (
        <ServerIcon className='h-4 w-4' />
      )}
      Server settings
    </>
  );
}

const ServerSettings = {
  Content: ServerSettingsContent,
  Trigger: ServerSettingsTrigger,
};

export default ServerSettings;

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox } from '~/components/ui/Checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/Form';
import { Slider } from '~/components/ui/Slider';
import { isNaNArr } from '~/lib/utils';

export const weatherSchema = z.object({
  includeWeather: z.boolean().default(false),
  rainLevel: z.string().optional(),
  cloudLevel: z.string().optional(),
  randomness: z.string().optional(),
  temperature: z.string().optional(),
});

export const weatherDefaultValues: Partial<z.infer<typeof weatherSchema>> = {
  rainLevel: '0',
  cloudLevel: '0',
  randomness: '0',
  temperature: '10',
};

export default function Weather() {
  const form = useFormContext<z.infer<typeof weatherSchema>>();

  return (
    <>
      <FormField
        control={form.control}
        name='includeWeather'
        render={({ field }) => (
          <div className='flex items-center gap-2'>
            <Checkbox
              id='weather'
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label
              htmlFor='weather'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Include weather
            </label>
          </div>
        )}
      />

      {form.watch('includeWeather') && (
        <>
          <FormField
            control={form.control}
            name='rainLevel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rain level</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    <Slider
                      value={isNaNArr(field.value)}
                      onValueChange={v => field.onChange(v[0]?.toString())}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                    <span>{Number(field.value).toFixed(2)}</span>
                  </div>
                </FormControl>
                <FormDescription className='!text-sm'>
                  Between 0 and 1
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cloudLevel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cloud level</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    <Slider
                      value={isNaNArr(field.value)}
                      onValueChange={v => field.onChange(v[0]?.toString())}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                    <span>{Number(field.value).toFixed(2)}</span>
                  </div>
                </FormControl>
                <FormDescription className='!text-sm'>
                  Between 0 and 1
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='randomness'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Randomness</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    <Slider
                      value={isNaNArr(field.value)}
                      onValueChange={v => field.onChange(v[0]?.toString())}
                      min={0}
                      max={7}
                      step={1}
                    />
                    <span>{Number(field.value).toFixed(0)}</span>
                  </div>
                </FormControl>
                <FormDescription className='!text-sm'>
                  Between 0 and 7
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='temperature'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    <Slider
                      value={isNaNArr(field.value)}
                      onValueChange={v => field.onChange(v[0]?.toString())}
                      min={10}
                      max={45}
                      step={1}
                    />
                    <span>{Number(field.value).toFixed(0)}°C</span>
                  </div>
                </FormControl>
                <FormDescription className='!text-sm'>
                  Between 10 and 45
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}

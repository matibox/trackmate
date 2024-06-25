import { z } from 'zod';
import { serverInfoSchema } from './ServerSettings';
import { weatherSchema } from './Weather';
import { useFormContext } from 'react-hook-form';

export const raceSchema = z
  .object({
    type: z.literal('race'),
    date: z.date({ required_error: 'Date is required.' }),
    startTime: z
      .string({ required_error: 'Start time is required.' })
      .min(1, 'Start time is required.'),
    endTime: z
      .string({ required_error: 'End time is required.' })
      .min(1, 'End time is required.'),
    endsNextDay: z.boolean(),
  })
  .merge(serverInfoSchema)
  .merge(weatherSchema);

export default function Race() {
  const form = useFormContext<z.infer<typeof raceSchema>>();

  return <div>race</div>;
}

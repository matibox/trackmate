import { z } from 'zod';
import { type Country } from '~/lib/constants';

export const welcomeFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  country: z
    .string({ required_error: 'Please select a country.' })
    .pipe(z.custom<Country>()),
});

export type WelcomeFormSchema = z.infer<typeof welcomeFormSchema>;

import { z } from 'zod';
import { games } from '~/lib/constants';

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

export type StepOneSchema = z.infer<typeof stepOneSchema>;

export const stepTwoSchema = z.object({
  teamId: z.number().nullable().default(null),
  driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
});

export type StepTwoSchema = z.infer<typeof stepTwoSchema>;

export const newEventSchema = stepOneSchema.and(stepTwoSchema);

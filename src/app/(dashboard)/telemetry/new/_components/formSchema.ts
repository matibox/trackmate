import { z } from 'zod';
import { games } from '~/lib/constants';

export const uploadTelemetrySchema = z.object({
  game: z.enum(games, { required_error: 'Game is required.' }),
  track: z
    .string({ required_error: 'Track is required.' })
    .min(1, 'Track is required.'),
  car: z
    .string({ required_error: 'Car is required.' })
    .min(1, 'Car is required.'),
  file: z
    .instanceof(File, { message: 'Telmetry file is required.' })
    .refine(
      file =>
        ['application/zip', 'application/x-zip-compressed'].includes(file.type),
      { message: 'Only .zip files are accepted.' }
    ),
});

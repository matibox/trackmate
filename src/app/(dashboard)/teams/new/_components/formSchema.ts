import { z } from 'zod';

export const newTeamSchema = z.object({
  name: z
    .string({ required_error: 'Team name is required.' })
    .min(1, 'Team name is required.'),
});

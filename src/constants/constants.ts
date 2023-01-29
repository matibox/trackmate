import type { EventType, RoleName } from '@prisma/client';

export const roles: readonly RoleName[] = ['driver', 'manager'] as const;
export const raceTypes: readonly EventType[] = ['sprint', 'endurance'] as const;
export const placeholderTeammates = [
  {
    id: '1',
    name: 'Mr Pepega',
  },
  {
    id: '2',
    name: 'Mr Goat',
  },
];

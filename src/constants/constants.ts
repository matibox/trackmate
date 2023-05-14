import type { Steer, CornerPart } from '@prisma/client';

export const roles = ['driver', 'manager', 'socialMedia'] as const;
export const eventTypes = ['sprint', 'endurance'] as const;
export const resultsSortingOptions = [
  'eventDate',
  'createdAt',
  'position',
] as const;
export const cornerParts = [
  'entry',
  'apex',
  'exit',
] as const satisfies readonly CornerPart[];
export const steers = [
  'understeer',
  'oversteer',
] as const satisfies readonly Steer[];

export const notificationGroups = [
  'newResultNotification',
  'newChampResultNotification',
  'feedbackRequestNotification',
] as const;

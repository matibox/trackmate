import type { Steer, CornerPart, RoleName, EventType } from '@prisma/client';

export const roles = [
  'driver',
  'manager',
  'socialMedia',
] as const satisfies readonly RoleName[];

export const eventTypes = [
  'sprint',
  'endurance',
] as const satisfies readonly EventType[];

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

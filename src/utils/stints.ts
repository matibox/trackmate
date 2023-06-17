import { type Stint } from '@prisma/client';
import { getMinutes } from './helpers';
import dayjs from 'dayjs';

export const getStintDuration = (stint: Stint) => {
  const { duration, estimatedEnd, start } = stint;
  if (duration) return duration;

  return getMinutes(estimatedEnd) - getMinutes(start);
};

export const formatDuration = (duration: number) => {
  return dayjs(
    new Date(dayjs().year(), dayjs().month(), dayjs().date(), duration / 60)
  ).format('HH:mm:ss');
};

export const durationStrToNum = (durationString: string) => {
  const [h, m, s] = durationString.split(':').map(Number) as [
    number,
    number,
    number
  ];

  return dayjs(
    new Date(dayjs().year(), dayjs().month(), dayjs().date(), h, m, s)
  );
};

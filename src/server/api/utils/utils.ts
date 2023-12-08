import dayjs from 'dayjs';
import { type z } from 'zod';
import { type step4SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step4Single';
import { timeStringToMinutes } from '~/lib/utils';
import crypto from 'crypto';

const iv = Buffer.from(process.env.ENCRYPTION_IV as string, 'hex');
const key = Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex');
const alg = 'aes-256-cbc';

export function getSessionTimespan({
  session,
}: {
  session: z.infer<typeof step4SingleSchema>['sessions'][number];
}) {
  const start = timeStringToMinutes(session.start);
  const end = 'end' in session ? timeStringToMinutes(session.end) : undefined;

  const baseDate = dayjs(session.date)
    .set('minutes', 0)
    .set('hours', 0)
    .set('seconds', 0);

  const startDate = baseDate.add(start, 'minutes');
  const endDate = end ? baseDate.add(end, 'minutes') : undefined;

  if ('endsNextDay' in session && session.endsNextDay && endDate) {
    return {
      start: startDate.toDate(),
      end: endDate.add(24, 'hours').toDate(),
    };
  }

  return {
    start: startDate.toDate(),
    end: endDate?.toDate(),
  };
}

export function encryptString(str: string) {
  const cipher = crypto.createCipheriv(alg, key, iv);
  let encrypted = cipher.update(str, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

export function decryptString(str: string) {
  const decipher = crypto.createDecipheriv(alg, key, iv);
  let decrypted = decipher.update(str, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

export function getReminderDate({
  daysBefore,
  sessionDate,
}: {
  daysBefore: number;
  sessionDate: Date;
}) {
  return dayjs(sessionDate)
    .subtract(daysBefore, 'days')
    .set('hour', 5)
    .toDate();
}

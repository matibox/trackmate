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
  raceDate: baseDate,
}: {
  session: z.infer<typeof step4SingleSchema>['sessions'][number];
  raceDate: Date;
}) {
  const raceDate = dayjs(baseDate);
  const start = timeStringToMinutes(session.start);
  const end = 'end' in session ? timeStringToMinutes(session.end) : undefined;

  if ('customDay' in session && 'end' in session) {
    const startDate = dayjs(session.customDay).add(start, 'minutes');
    const endDate = dayjs(session.customDay).add(
      timeStringToMinutes(session.end),
      'minutes'
    );

    return {
      start: startDate.toDate(),
      end: endDate.toDate(),
    };
  }

  if ('endsNextDay' in session && session.endsNextDay && 'end' in session) {
    const startDate = dayjs(raceDate).add(start, 'minutes');
    const endDate = dayjs(raceDate)
      .add(timeStringToMinutes(session.end), 'minutes')
      .add(24, 'hours');

    return {
      start: startDate.toDate(),
      end: endDate.toDate(),
    };
  }

  return {
    start: raceDate.add(start, 'minutes').toDate(),
    end: end ? raceDate.add(end, 'minutes').toDate() : undefined,
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

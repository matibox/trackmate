import dayjs from 'dayjs';
import { type z } from 'zod';
import { type step4SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step4Single';
import { timeStringToMinutes } from '~/lib/utils';
import crypto from 'crypto';

const iv = Buffer.from(process.env.ENCRYPTION_IV as string, 'hex');
const key = Buffer.from(process.env.ENCRYPTION_KEY as string, 'hex');
const alg = 'aes-256-cbc';

// export function getSessionTimespan({
//   session,
//   raceDate: baseDate,
// }: {
//   session: z.infer<typeof step4SingleSchema>['sessions'][number];
//   raceDate: Date;
// }) {
//   const raceDate = dayjs(baseDate);
//   const start = timeStringToMinutes(session.start);
//   const end = 'end' in session ? timeStringToMinutes(session.end) : undefined;

//   if ('endsNextDay' in session && session.endsNextDay && 'end' in session) {
//     const startDate = dayjs(raceDate).add(start, 'minutes');
//     const endDate = dayjs(raceDate)
//       .add(timeStringToMinutes(session.end), 'minutes')
//       .add(24, 'hours');

//     return {
//       start: startDate.toDate(),
//       end: endDate.toDate(),
//     };
//   }

//   return {
//     start: raceDate.add(start, 'minutes').toDate(),
//     end: end ? raceDate.add(end, 'minutes').toDate() : undefined,
//   };
// }

export function getSessionTimespan({
  session,
}: {
  session: z.infer<typeof step4SingleSchema>['sessions'][number];
}) {
  const start = timeStringToMinutes(session.start);
  const end = 'end' in session ? timeStringToMinutes(session.end) : undefined;

  console.log('session date', dayjs(session.date).format('YYYY/MM/DD HH:mm'));

  const baseDate = dayjs(session.date)
    .set('minutes', 0)
    .set('hours', 0)
    .set('seconds', 0);

  console.log('base date', baseDate.format('YYYY/MM/DD HH:mm'));

  const startDate = baseDate.add(start, 'minutes');
  const endDate = end ? baseDate.add(end, 'minutes') : undefined;

  console.log('startDate', startDate.format('YYYY/MM/DD HH:mm'));
  console.log('endDate', endDate?.format('YYYY/MM/DD HH:mm'));

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

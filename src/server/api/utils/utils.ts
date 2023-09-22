import dayjs from 'dayjs';
import { type z } from 'zod';
import { type stepFourSingleSchema } from '~/core/dashboard/calendar/new-event/StepFourSingle';
import { timeStringToMinutes } from '~/lib/utils';

export function getSessionTimespan({
  session,
  raceDate: baseDate,
}: {
  session: z.infer<typeof stepFourSingleSchema>['sessions'][number];
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

  if ('endsNextDay' in session && 'end' in session) {
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

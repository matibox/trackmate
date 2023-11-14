import { describe, expect, it } from 'vitest';
import { type z } from 'zod';
import { type step4SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step4Single';
import { getSessionTimespan } from './utils';
import dayjs from 'dayjs';

describe('getSessionTimespan', () => {
  type Session = z.infer<typeof step4SingleSchema>['sessions'][number];

  const raceDate = dayjs(
    new Date(dayjs().year(), dayjs().month(), dayjs().date())
  ).toDate();

  it('returns correct time if same day as default date', () => {
    const session: Session = {
      id: 'test',
      driverId: 'test',

      type: 'qualifying',
      start: '15:00',
      end: '16:00',
    };

    const returned = getSessionTimespan({ session, raceDate });

    expect(dayjs(returned.start).format('YYYY MM DD')).toEqual(
      dayjs().format('YYYY MM DD')
    );
    expect(dayjs(returned.start).hour()).toEqual(15);
    expect(dayjs(returned.start).minute()).toEqual(0);
    expect(dayjs(returned.end).format('YYYY MM DD')).toEqual(
      dayjs().format('YYYY MM DD')
    );
    expect(dayjs(returned.end).hour()).toEqual(16);
    expect(dayjs(returned.end).minute()).toEqual(0);
  });

  it('returns correct time if different day as race', () => {
    const session: Session = {
      id: 'test',

      type: 'practice',
      start: '15:00',
      end: '16:00',
      customDay: dayjs(raceDate).subtract(3, 'days').toDate(),
    };

    const returned = getSessionTimespan({ session, raceDate });

    expect(dayjs(returned.start).format('YYYY MM DD')).not.toEqual(
      dayjs(raceDate).format('YYYY MM DD')
    );
    expect(dayjs(returned.start).hour()).toEqual(15);
    expect(dayjs(returned.start).minute()).toEqual(0);
    expect(dayjs(returned.end).format('YYYY MM DD')).not.toEqual(
      dayjs(raceDate).format('YYYY MM DD')
    );
    expect(dayjs(returned.end).hour()).toEqual(16);
    expect(dayjs(returned.end).minute()).toEqual(0);
  });

  it('returns correct time if race ends next day', () => {
    const session: Session = {
      id: 'test',
      driverIds: ['a', 'b'],

      type: 'race',
      start: '12:00',
      end: '12:00',
      endsNextDay: true,
    };

    const returned = getSessionTimespan({ session, raceDate });

    expect(dayjs(returned.start).format('YYYY MM DD')).toEqual(
      dayjs(raceDate).format('YYYY MM DD')
    );
    expect(dayjs(returned.start).hour()).toEqual(12);
    expect(dayjs(returned.start).minute()).toEqual(0);
    expect(dayjs(returned.end).format('YYYY MM DD')).toEqual(
      dayjs(raceDate).add(1, 'day').format('YYYY MM DD')
    );
    expect(dayjs(returned.end).hour()).toEqual(12);
    expect(dayjs(returned.end).minute()).toEqual(0);
  });
});

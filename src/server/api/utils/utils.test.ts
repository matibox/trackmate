import { describe, expect, it } from 'vitest';
import { type z } from 'zod';
import { type step4SingleSchema } from '~/core/dashboard/calendar/new-event/components/Step4Single';
import {
  decryptString,
  encryptString,
  getReminderDate,
  getSessionTimespan,
} from './utils';
import dayjs from 'dayjs';
import crypto from 'crypto';

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
      date: new Date(),
      start: '15:00',
      end: '16:00',
    };

    const returned = getSessionTimespan({ session });

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

  it('returns correct time if race ends next day', () => {
    const session: Session = {
      id: 'test',
      driverIds: ['a', 'b'],

      type: 'race',
      date: new Date(),
      start: '12:00',
      end: '12:00',
      endsNextDay: true,
    };

    const returned = getSessionTimespan({ session });

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

describe('encrypt and decrypt string', () => {
  it('encrypts and decrypts string correctly', () => {
    const string = crypto.randomBytes(16).toString('hex');

    const encryptedString = encryptString(string);
    const decryptedString = decryptString(encryptedString);

    expect(string).toEqual(decryptedString);
  });
});

describe('getReminderDate', () => {
  it('returns correct date', () => {
    for (let i = 1; i <= 3; i++) {
      const testDate = dayjs('2018-04-13 19:18').toDate();
      const dateOne = getReminderDate({
        daysBefore: i,
        sessionDate: dayjs().toDate(),
      });
      const dateTwo = getReminderDate({ daysBefore: i, sessionDate: testDate });

      expect(dayjs(dateOne).date()).toEqual(dayjs().date() - i);
      expect(dayjs(dateOne).hour()).toEqual(5);
      expect(dayjs(dateTwo).date()).toEqual(dayjs(testDate).date() - i);
      expect(dayjs(dateTwo).hour()).toEqual(5);
    }
  });
});

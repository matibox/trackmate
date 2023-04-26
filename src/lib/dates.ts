import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';
import calendar from 'dayjs/plugin/calendar';
import enLocale from 'dayjs/locale/en';

dayjs.extend(updateLocale);
dayjs.extend(weekday);
dayjs.extend(calendar);

dayjs.locale('calendar', {
  ...enLocale,
  weekStart: 1,
});

export function getCalendarPage(
  month = dayjs().month(),
  year = dayjs().year()
) {
  const firstDayOfTheMonth = dayjs(new Date(year, month, 1))
    .locale('calendar')
    .weekday();
  let currentMonthCount = 0 - firstDayOfTheMonth;

  const calendarPage = new Array(6).fill([]).map(() =>
    new Array(7).fill(null).map(() => {
      currentMonthCount++;
      return dayjs(new Date(year, month, currentMonthCount));
    })
  );

  return calendarPage;
}

export function getCalendarPageBoundaries(page: dayjs.Dayjs[][]) {
  return (
    [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      page[0]![0],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      page[page.length - 1]![page[page.length - 1]!.length - 1],
    ] as [dayjs.Dayjs, dayjs.Dayjs]
  ).map(day => new Date(day.format('YYYY MM DD'))) as [Date, Date];
}

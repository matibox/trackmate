import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(updateLocale);
dayjs.extend(weekday);

dayjs.locale('calendar', {
  weekStart: 1,
});

export function getCalendarPage(month = dayjs().month()) {
  const year = dayjs().year();
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

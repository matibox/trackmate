import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import enLocale from 'dayjs/locale/en';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(updateLocale);
dayjs.extend(weekday);

dayjs.locale('calendar', {
  ...enLocale,
  weekStart: 1,
});

export function generateDayGrid(
  month = dayjs().month(),
  year = dayjs().year()
) {
  const firstDayOfTheMonth = dayjs(new Date(year, month, 1))
    .locale('calendar')
    .weekday();
  let currentMonthCount = 0 - firstDayOfTheMonth;

  const dayGrid = new Array(6).fill([]).map(() =>
    new Array(7).fill(null).map(() => {
      currentMonthCount++;
      return dayjs(new Date(year, month, currentMonthCount));
    })
  );

  return dayGrid;
}

export function addOrdinal(number: number) {
  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
}

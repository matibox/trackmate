import day from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import enLocale from 'dayjs/locale/en';
import weekday from 'dayjs/plugin/weekday';

const dayjs = day;

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

export function digit8StrToDate(str: string) {
  const day = `${str[0]}${str[1]}`;
  const month = `${str[2]}${str[3]}`;
  const year = str.slice(4);

  return dayjs(`${year}/${month}/${day}`);
}

export default dayjs;

import Calendar from './_components/Calendar';
import CalendarContextProvider from './_components/CalendarContext';
import CalendarNav from './_components/CalendarNav';

export default async function CalendarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CalendarContextProvider>
      <CalendarNav />
      <Calendar />
      {children}
    </CalendarContextProvider>
  );
}

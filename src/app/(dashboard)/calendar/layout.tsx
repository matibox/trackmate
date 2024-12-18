import CalendarContextProvider from './_components/CalendarContext';

export default async function CalendarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CalendarContextProvider>{children}</CalendarContextProvider>;
}

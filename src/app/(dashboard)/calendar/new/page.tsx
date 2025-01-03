import Calendar from '../_components/Calendar';
import CalendarNav from '../_components/CalendarNav';
import NewEvent from './_components/NewEvent';

export default function NewEventPage() {
  return (
    <>
      <CalendarNav />
      <Calendar />
      <NewEvent />
    </>
  );
}

'use client';

import {
  CalendarIcon,
  CarIcon,
  Gamepad2Icon,
  IdCardIcon,
  type LucideIcon,
  MapPinned,
  UsersRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Flag from '~/components/Flag';
import ResponsiveDialog from '~/components/ui/responsive-dialog';
import dayjs from '~/lib/dates';
import { api, type RouterOutputs } from '~/trpc/react';

type Event = RouterOutputs['event']['byId'];

// TODO type property: string | select | date | custom (team, drivers)
const eventCategories: Array<{
  icon: LucideIcon;
  label: keyof Pick<
    Event,
    'date' | 'game' | 'track' | 'car' | 'team' | 'drivers'
  >;
}> = [
  {
    icon: CalendarIcon,
    label: 'date',
  },
  {
    icon: Gamepad2Icon,
    label: 'game',
  },
  {
    icon: MapPinned,
    label: 'track',
  },
  {
    icon: CarIcon,
    label: 'car',
  },
  {
    icon: IdCardIcon,
    label: 'team',
  },
  {
    icon: UsersRound,
    label: 'drivers',
  },
] as const;

export default function EventDetails({ eventId }: { eventId: number }) {
  // TODO get event id from serach params
  const router = useRouter();

  const [event] = api.event.byId.useSuspenseQuery({ eventId });

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={open => {
        if (!open) router.back();
      }}
      title={event.name[0].toUpperCase() + event.name.slice(1)}
      description="Event details"
    >
      <div className="grid grid-cols-[120px,_minmax(0,_1fr)] text-sm">
        <div className="flex flex-col gap-2">
          {eventCategories.map(cat => (
            <div
              key={cat.label}
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <cat.icon className="h-5 w-5" />
              {cat.label[0].toUpperCase() + cat.label.slice(1)}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {eventCategories
            .map(e => e.label)
            .map(key => {
              switch (key) {
                case 'date':
                  return (
                    <div key={key}>
                      {dayjs(event[key]).format('DD MMMM YYYY')}
                    </div>
                  );
                case 'team':
                  return <div key={key}>{event[key]?.name ?? '-'}</div>;
                case 'drivers':
                  return event[key].map(driver => (
                    <div key={driver.id} className="flex items-center gap-1.5">
                      <Flag country={driver.country} />
                      <span>
                        {driver.firstName} {driver.lastName}
                      </span>
                    </div>
                  ));
                default:
                  return <div key={key}>{event[key]}</div>;
              }
            })}
        </div>
      </div>
    </ResponsiveDialog>
  );
}

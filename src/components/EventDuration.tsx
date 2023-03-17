import { type HTMLAttributes, useMemo, type FC } from 'react';
import { usePersistHydration } from '../hooks/usePersistHydration';
import { useSettingsStore } from '../store/useSettingsStore';

interface EventDurationProps extends HTMLAttributes<HTMLSpanElement> {
  duration: number;
}

const EventDuration: FC<EventDurationProps> = ({ duration, ...props }) => {
  const { setEventDurationType } = useSettingsStore();
  const eventDurationType = usePersistHydration(
    useSettingsStore().settings.eventDurationType
  );

  const processedDuration = useMemo(() => {
    if (!eventDurationType) {
      setEventDurationType('minutes');
      return `${duration} minutes`;
    }
    if (eventDurationType === 'minutes') return `${duration} minutes`;

    let durationString = '';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (duration === 60) durationString += `${hours} hour`;
    if (duration > 60) durationString += `${hours} hours`;
    if (minutes === 1) durationString += `${minutes} minute`;
    if (minutes > 1) durationString += ` ${minutes} minutes`;

    return durationString;
  }, [duration, eventDurationType, setEventDurationType]);

  return <span {...props}>{processedDuration}</span>;
};

export default EventDuration;

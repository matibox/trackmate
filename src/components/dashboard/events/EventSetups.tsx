import Popup from '@ui/Popup';
import { type FC } from 'react';
import { useEventStore } from '../../../store/useEventStore';
import PopupHeader from '@ui/PopupHeader';

const EventSetups: FC = () => {
  const {
    setups: { close, isOpened, event },
  } = useEventStore();

  // TODO: fetch setups

  return (
    <Popup
      close={close}
      condition={isOpened}
      header={
        <PopupHeader
          close={close}
          title={`Setups - ${
            event?.championship?.name
              ? `${event?.championship?.name} - ${event.title ?? 'Event'}`
              : event?.title ?? 'Event'
          }`}
        />
      }
    >
      setups
    </Popup>
  );
};

export default EventSetups;

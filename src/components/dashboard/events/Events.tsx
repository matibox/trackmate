import Tile from '@ui/Tile';
import { type FC } from 'react';
import EventsHeader from './Header';

const Events: FC = () => {
  return <Tile header={<EventsHeader />}>events</Tile>;
};

export default Events;

import Tile from '@ui/Tile';
import { type FC } from 'react';
import ChampionshipsHeader from './Header';

const Championships: FC = () => {
  return <Tile header={<ChampionshipsHeader />}>championships</Tile>;
};

export default Championships;

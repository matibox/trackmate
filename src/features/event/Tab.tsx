import { type ReactNode, type FC } from 'react';
import { type TabLabel, useEventStore } from './store';

type TabProps = {
  showedOn: Lowercase<TabLabel>;
  children: ReactNode;
};

const Tab: FC<TabProps> = ({ showedOn, children }) => {
  const { getSelectedTab } = useEventStore();

  return getSelectedTab().label.toLowerCase() === showedOn ? (
    <div>{children}</div>
  ) : null;
};

export default Tab;

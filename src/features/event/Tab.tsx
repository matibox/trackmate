import { type ReactNode, type FC } from 'react';
import { type TabLabel, useEventTabsStore } from './store';

type TabProps = {
  showedOn: Lowercase<TabLabel>;
  children: ReactNode;
};

const Tab: FC<TabProps> = ({ showedOn, children }) => {
  const { getSelectedTab } = useEventTabsStore();

  return getSelectedTab().label.toLowerCase() === showedOn ? (
    <div>{children}</div>
  ) : null;
};

export default Tab;

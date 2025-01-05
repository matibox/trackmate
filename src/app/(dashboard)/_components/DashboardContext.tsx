'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { type RouterOutputs } from '~/trpc/react';

type Teams = RouterOutputs['user']['teams'];

type CalendarContext = {
  teams: Teams;
  selectedTeam: Teams[number];
  selectTeam: (id: number) => void;
};

const DashboardContext = createContext<CalendarContext | null>(null);

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);

  if (!ctx) {
    throw new Error(
      'useDashboardContext has to be used within <DashboardContext.Provider>'
    );
  }

  return ctx;
}

export default function DashboardContextProvider({
  teams,
  defaultSelectedId,
  children,
}: {
  teams: Teams;
  defaultSelectedId: string | undefined;
  children: ReactNode;
}) {
  const [selectedTeam, setSelectedTeam] = useState(
    defaultSelectedId
      ? (teams.find(t => t.id === parseInt(defaultSelectedId)) ?? teams[0])
      : teams[0]
  );

  const selectTeam = useCallback(
    (id: number) => {
      setSelectedTeam(prev => teams.find(team => team.id === id) ?? prev);
      document.cookie = `sidebar:team=${id}; path=/; max-age=${60 * 60 * 24 * 7}`;
    },
    [teams]
  );

  return (
    <DashboardContext.Provider
      value={{
        teams,
        selectedTeam,
        selectTeam,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

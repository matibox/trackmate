'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';
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
  children,
}: {
  teams: Teams;
  children: ReactNode;
}) {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);

  function selectTeam(id: number) {
    setSelectedTeam(prev => teams.find(team => team.id === id) ?? prev);
  }

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

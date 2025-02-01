'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';
import { api, type RouterOutputs } from '~/trpc/react';

type Teams = RouterOutputs['user']['teams'];

type CalendarContext = {
  teams: Teams;
  selectedTeam: Teams[number] | null;
  selectTeam: (id: number, options?: { refetch: boolean }) => Promise<void>;
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

function setTeamCookie(id: number) {
  document.cookie = `sidebar:team=${id}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export default function DashboardContextProvider({
  teams,
  defaultSelectedId,
  children,
}: {
  teams: RouterOutputs['user']['teams'];
  defaultSelectedId: number | undefined;
  children: ReactNode;
}) {
  const teamsQuery = api.user.teams.useQuery(undefined, {
    initialData: teams,
  });

  const [selectedTeam, setSelectedTeam] = useState<Teams[number] | null>(() => {
    if (teamsQuery.data && teamsQuery.data.length > 0) {
      const foundTeam = teamsQuery.data.find(t => t.id === defaultSelectedId);

      if (!foundTeam) {
        const team = teamsQuery.data[0];
        setTeamCookie(team.id);
        return team;
      }

      return foundTeam;
    }

    return null;
  });

  async function selectTeam(id: number, { refetch } = { refetch: false }) {
    const { data: teams } = refetch ? await teamsQuery.refetch() : teamsQuery;

    setSelectedTeam(prev => teams?.find(team => team.id === id) ?? prev);
    setTeamCookie(id);
  }

  return (
    <DashboardContext.Provider
      value={{
        teams: teamsQuery.data,
        selectedTeam,
        selectTeam,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { type RouterOutputs } from '~/trpc/react';

export function TeamSwitcher({
  teams,
}: {
  teams: RouterOutputs['user']['teams'];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {teams.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={undefined} alt={undefined} />
                    <AvatarFallback className="!rounded-md bg-sidebar-primary">
                      {activeTeam.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {teams.map(team => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
                    <Avatar className="h-6 w-6 rounded-lg">
                      <AvatarImage src={undefined} alt={undefined} />
                      <AvatarFallback className="flex !rounded-md bg-sidebar-primary text-xs">
                        {activeTeam.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {team.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Create a team
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton size="lg">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">
              Create a team
            </div>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

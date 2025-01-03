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
            {teams.length > 0 ? (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Teams
                </DropdownMenuLabel>
                {teams.map(team => (
                  <DropdownMenuItem
                    key={team.name}
                    onClick={() => setActiveTeam(team)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      {/* <team.logo className="size-4 shrink-0" /> */}
                    </div>
                    {team.name}
                    {/* <DropdownMenuShortcut>alt+{index + 1}</DropdownMenuShortcut> */}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : (
              <p className="p-2 text-sm">You don&apos;t belong to any team</p>
            )}

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

'use client';

import { z } from 'zod';
import Step from './Step';
import { useFormContext } from 'react-hook-form';
import { useDashboardContext } from '~/app/(dashboard)/_components/DashboardContext';
import { FormField, FormItem, FormLabel } from '~/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { SidebarMenuButton } from '~/components/ui/sidebar';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { BanIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';

export const stepTwoSchema = z.object({
  teamId: z.number().nullable(),
  driverIds: z.array(z.string()).min(1, 'Select at least 1 driver.'),
});

export default function Step2({ editMode = false }: { editMode?: boolean }) {
  const form = useFormContext<z.infer<typeof stepTwoSchema>>();
  const { teams } = useDashboardContext();

  const hasNoTeams = teams.length === 0;

  return (
    <Step
      title={`${editMode ? 'Edit' : 'Create'} an event`}
      description="Choose the team and drivers, click next when you're ready."
    >
      <FormField
        control={form.control}
        name="teamId"
        render={
          ({ field }) => {
            const team = teams.find(t => t.id === field.value);

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Team (optional)</FormLabel>
                {!hasNoTeams ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                          {team !== undefined ? (
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarFallback className="!rounded-md bg-sidebar-primary">
                                {team?.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                              <BanIcon className="h-4 w-4 text-muted-foreground" />
                            </Avatar>
                          )}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {team?.name ?? 'No team'}
                          </span>
                          {team?.memberCount !== undefined && (
                            <span className="truncate text-xs">
                              {team.memberCount} member
                              {team.memberCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <ChevronsUpDownIcon className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Teams
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => field.onChange(null)}
                        className="gap-2 p-2"
                      >
                        <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
                          <Avatar className="flex h-6 w-6 items-center justify-center rounded-lg">
                            <BanIcon className="text-muted-foreground" />
                          </Avatar>
                        </div>
                        No team
                      </DropdownMenuItem>
                      {teams.map(team => (
                        <DropdownMenuItem
                          key={team.name}
                          onClick={() => field.onChange(team.id)}
                          className="gap-2 p-2"
                        >
                          <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
                            <Avatar className="h-6 w-6 rounded-lg">
                              <AvatarFallback className="flex !rounded-md bg-sidebar-primary text-xs">
                                {team.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          {team.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t belong to any team.
                    </p>
                    <SidebarMenuButton className="py-5">
                      <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                        <PlusIcon className="size-4" />
                      </div>
                      <div className="font-medium text-muted-foreground">
                        Create a team
                      </div>
                    </SidebarMenuButton>
                  </>
                )}
              </FormItem>
            );
          }
          // <FormItem className='flex flex-col'>
          //   <FormLabel>Team</FormLabel>
          //   <Select
          //     onValueChange={e => {
          //       field.onChange(e);
          //       form.resetField('rosterId', { defaultValue: '' });
          //     }}
          //     value={field.value}
          //   >
          //     <FormControl>
          //       <SelectTrigger>
          //         <SelectValue placeholder='Select team' />
          //       </SelectTrigger>
          //     </FormControl>
          //     <SelectContent>
          //       {teamStatus === 'loading' && (
          //         <Loader2Icon className='mx-auto my-1 h-4 w-4 animate-spin' />
          //       )}
          //       {teams?.map(team => (
          //         <SelectItem key={team.id} value={team.id}>
          //           {team.name}
          //         </SelectItem>
          //       ))}
          //     </SelectContent>
          //   </Select>
          //   <FormMessage />
          // </FormItem>
        }
      />
    </Step>
  );
}

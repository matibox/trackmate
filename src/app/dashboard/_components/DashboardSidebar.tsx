import { HomeIcon, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '~/components/ui/sidebar';
import { SidebarProfile } from './SidebarProfile';
import { auth } from '~/server/auth';

const items: Array<{
  title: string;
  url: `/${string}` | `#${string}`;
  icon: LucideIcon;
}> = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: HomeIcon,
  },
];

export default async function DashboardSidebar() {
  const session = await auth();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Trackmate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarProfile user={session!.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

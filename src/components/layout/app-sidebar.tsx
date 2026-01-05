
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AscendWealthLogo } from '@/components/icons/logo';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ClipboardList,
  Briefcase,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE', 'CUSTOMER'] },
  { href: '/customers', label: 'Customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE'] },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList, roles: ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE'] },
  { href: '/doc-vault', label: 'Doc Vault', icon: FolderOpen, roles: ['CUSTOMER'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { effectiveUser } = useCurrentUser();
  const { state: sidebarState } = useSidebar();
  const userRole = effectiveUser?.role;

  const isActive = (href: string) => {
    // Make dashboard active only on exact match
    if (href === '/') {
        return pathname === href;
    }
    // For other links, active if path starts with the href
    return pathname.startsWith(href);
  };

  if (!userRole) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <AscendWealthLogo className={cn(sidebarState === 'collapsed' && 'hidden')} />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center justify-between gap-2">
          <AscendWealthLogo
            className={cn(sidebarState === "collapsed" && "hidden")}
          />
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                    <item.icon />
                    <span className={cn(sidebarState === 'collapsed' && 'hidden')}>
                      {item.label}
                    </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add elements to footer here */}
      </SidebarFooter>
    </Sidebar>
  );
}


'use client';

import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  UserCog,
  Shield,
  ShieldCheck,
  Briefcase,
  UserSquare,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { HIERARCHY } from '@/lib/constants';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AscendWealthLogo } from '../icons/logo';
import { ScrollArea } from '../ui/scroll-area';

const settingsMenuItems = [
  { href: '/admins', label: 'Admins', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
  { href: '/rms', label: 'RMs', icon: UserSquare, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/associates', label: 'Associates', icon: Briefcase, roles: ['SUPER_ADMIN', 'ADMIN', 'RM'] },
  { href: '/user-mapping', label: 'User Mapping', icon: Users, roles: ['SUPER_ADMIN'] },
  { href: '/role-management', label: 'Role Management', icon: Shield, roles: ['SUPER_ADMIN'] },
];


export function AppHeader() {
  const {
    currentUser,
    impersonatedUser,
    effectiveUser,
    login,
    stopImpersonation,
    allUsers,
  } = useCurrentUser();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const sortedUsers = [...allUsers].sort((a, b) => {
    const roleA = HIERARCHY.indexOf(a.role);
    const roleB = HIERARCHY.indexOf(b.role);
    if (roleA !== roleB) {
      return roleA - roleB;
    }
    return a.name.localeCompare(b.name);
  });
  
  const userRole = effectiveUser?.role;
  const visibleSettingsItems = userRole ? settingsMenuItems.filter(item => item.roles.includes(userRole)) : [];
  const canViewAdminSettings = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex items-center">
        <AscendWealthLogo />
      </div>

      {impersonatedUser && (
        <div className="flex-1 md:flex-grow-0">
          <Badge variant="destructive" className="animate-pulse">
            Impersonating: {impersonatedUser.name} ({impersonatedUser.role})
          </Badge>
        </div>
      )}

      <div className={cn('flex-1')}></div>

      <TooltipProvider>
        <div className="flex items-center gap-1">
          {visibleSettingsItems.length > 0 && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-[#1D4ED8] hover:text-white">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Quick Settings</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quick Settings</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {visibleSettingsItems.map(item => (
                      <Link href={item.href} key={item.href} passHref>
                        <DropdownMenuItem>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
          )}

          {canViewAdminSettings && (
             <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" asChild className="text-gray-600 hover:bg-[#1D4ED8] hover:text-white">
                    <Link href="/admin-settings">
                      <UserCog className="h-5 w-5" />
                      <span className="sr-only">Admin Settings Page</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Admin Settings</p>
                </TooltipContent>
              </Tooltip>
          )}


          <DropdownMenu>
             <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full text-gray-600 hover:bg-[#1D4ED8] hover:text-white">
                      <Bell />
                      <span className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-auto min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        9+
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-sm text-muted-foreground">
                No new notifications.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full text-gray-700 hover:bg-[#1D4ED8] hover:text-white">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={effectiveUser?.avatarUrl} alt={effectiveUser?.name} />
                  <AvatarFallback>{effectiveUser ? getInitials(effectiveUser.name) : '...'}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{effectiveUser?.name}</span>
                  <span className="text-xs text-muted-foreground">{effectiveUser?.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                {currentUser?.name}
                <div className="text-xs text-muted-foreground font-normal">{currentUser?.email}</div>
              </DropdownMenuLabel>

              {impersonatedUser && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={stopImpersonation} className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Stop Impersonating</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Switch Account</DropdownMenuLabel>
              <ScrollArea className="h-auto max-h-[350px]">
                <DropdownMenuRadioGroup value={currentUser?.id} onValueChange={login}>
                  {sortedUsers.map(user => (
                    <DropdownMenuRadioItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </header>
  );
}

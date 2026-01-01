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

const settingsMenuItems = [
  { href: '/admins', label: 'Admins', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
  { href: '/rms', label: 'RMs', icon: UserSquare, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/associates', label: 'Associates', icon: Briefcase, roles: ['SUPER_ADMIN', 'ADMIN', 'RM'] },
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


  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-card px-4 sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />

      {impersonatedUser && (
        <div className="flex-1">
          <Badge variant="destructive" className="animate-pulse">
            Impersonating: {impersonatedUser.name} ({impersonatedUser.role})
          </Badge>
        </div>
      )}

      <div className={cn('flex-1', impersonatedUser && 'hidden md:block')}></div>

      {visibleSettingsItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
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


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Bell />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
          </Button>
        </DropdownMenuTrigger>
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
          <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
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
          <DropdownMenuRadioGroup value={currentUser?.id} onValueChange={login}>
            {sortedUsers.map(user => (
              <DropdownMenuRadioItem key={user.id} value={user.id}>
                {user.name} ({user.role})
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

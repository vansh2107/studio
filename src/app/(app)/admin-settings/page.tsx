
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  ShieldCheck,
  UserSquare,
  Briefcase,
  Shield,
  ChevronRight,
  Home,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const settingsItems = [
  { href: '/admins', label: 'Admins', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
  { href: '/rms', label: 'RMs', icon: UserSquare, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/associates', label: 'Associates', icon: Briefcase, roles: ['SUPER_ADMIN', 'ADMIN', 'RM'] },
  { href: '/user-mapping', label: 'User Mapping', icon: Users, roles: ['SUPER_ADMIN'] },
  { href: '/role-management', label: 'Role Management', icon: Shield, roles: ['SUPER_ADMIN'] },
];

export default function AdminSettingsPage() {
  const { effectiveUser } = useCurrentUser();

  if (!effectiveUser || (effectiveUser.role !== 'SUPER_ADMIN' && effectiveUser.role !== 'ADMIN')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  const userRole = effectiveUser.role;
  const visibleSettingsItems = settingsItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Admin Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Settings</h1>
        <p className="text-muted-foreground">Manage system users and roles.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleSettingsItems.map(item => (
          <Link href={item.href} key={item.href} passHref>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-md bg-secondary text-secondary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

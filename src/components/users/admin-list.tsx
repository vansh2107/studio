
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Admin, SuperAdmin } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminList({ initialAdmins }: { initialAdmins: Admin[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>(initialSuperAdmins);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const allAdminUsers = [...superAdmins, ...admins];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Management</h1>
        <p className="text-muted-foreground">View and manage Admin and Super Admin users.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAdminUsers.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={admin.avatarUrl} alt={admin.name} />
                        <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>{admin.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canImpersonate(admin) && (
                      <Button variant="outline" size="sm" onClick={() => impersonate(admin.id)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Impersonate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getAllAdmins } from '@/lib/mock-data';
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

export default function AdminsPage() {
  const { effectiveUser, canImpersonate, impersonate, hasPermission } = useCurrentUser();
  const admins = getAllAdmins();

  if (!hasPermission('ADMIN', 'view')) {
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admin Management</h1>
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
              {admins.map((admin) => (
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
                    <Badge variant="secondary">{admin.role}</Badge>
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

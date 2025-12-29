'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getCustomers, getMappedCustomersForAssociate, getMappedAssociatesForAdmin, User } from '@/lib/mock-data';
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
import { useMemo } from 'react';

export default function CustomersPage() {
  const { effectiveUser, canImpersonate, impersonate } = useCurrentUser();

  const customers = useMemo(() => {
    if (!effectiveUser) return [];
    switch (effectiveUser.role) {
      case 'SUPER_ADMIN':
        return getCustomers();
      case 'ADMIN':
        const associates = getMappedAssociatesForAdmin(effectiveUser.id);
        return associates.flatMap(assoc => getMappedCustomersForAssociate(assoc.id));
      case 'ASSOCIATE':
        return getMappedCustomersForAssociate(effectiveUser.id);
      default:
        return [];
    }
  }, [effectiveUser]);

  if (!['SUPER_ADMIN', 'ADMIN', 'ASSOCIATE'].includes(effectiveUser?.role ?? '')) {
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
      <h1 className="text-3xl font-bold font-headline">Customer Management</h1>
      <Card>
         <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family Account</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canImpersonate(customer) && (
                      <Button variant="outline" size="sm" onClick={() => impersonate(customer.id)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Enter Account
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

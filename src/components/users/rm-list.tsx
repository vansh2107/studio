
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { RelationshipManager, Admin } from '@/lib/types';
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
import { Card, CardContent } from '@/components/ui/card';

export function RMList({ initialRms }: { initialRms: RelationshipManager[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [rms, setRms] = useState<RelationshipManager[]>(initialRms);
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
  
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">RM Management</h1>
        <p className="text-muted-foreground">View and manage Relationship Managers.</p>
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
              {rms.map((rm) => (
                <TableRow key={rm.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={rm.avatarUrl} alt={rm.name} />
                        <AvatarFallback>{getInitials(rm.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{rm.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{rm.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rm.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canImpersonate(rm) && (
                      <Button variant="outline" size="sm" onClick={() => impersonate(rm.id)}>
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

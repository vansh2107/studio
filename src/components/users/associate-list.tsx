
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Associate, RelationshipManager } from '@/lib/types';
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

export function AssociateList({ initialAssociates }: { initialAssociates: Associate[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [associates, setAssociates] = useState<Associate[]>(initialAssociates);
  
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
  
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Associate Management</h1>
        <p className="text-muted-foreground">View and manage Associate users.</p>
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
              {associates.map((associate) => (
                <TableRow key={associate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={associate.avatarUrl} alt={associate.name} />
                        <AvatarFallback>{getInitials(associate.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{associate.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{associate.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{associate.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canImpersonate(associate) && (
                      <Button variant="outline" size="sm" onClick={() => impersonate(associate.id)}>
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

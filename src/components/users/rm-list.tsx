
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
import { LogIn, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAllAdmins } from '@/lib/mock-data';

const addRmSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  adminId: z.string().min(1, 'Please assign an Admin'),
});
type AddRmFormData = z.infer<typeof addRmSchema>;


export function RMList({ initialRms }: { initialRms: RelationshipManager[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [rms, setRms] = useState<RelationshipManager[]>(initialRms);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const allAdmins = getAllAdmins();

  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm<AddRmFormData>({
    resolver: zodResolver(addRmSchema),
    mode: 'onChange',
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
  
  const handleAddRm = (data: AddRmFormData) => {
    const newRm: RelationshipManager = {
      id: `rm-${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: 'RM',
      avatarUrl: `https://avatar.vercel.sh/${data.email}.png`,
      adminId: data.adminId,
    };
    setRms(prev => [...prev, newRm]);
    toast({ title: 'Success', description: 'RM added successfully.' });
    setIsAddModalOpen(false);
    reset();
  };
  
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">RM Management</h1>
            {isSuperAdmin && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New RM
                </Button>
            )}
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

       <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New RM</DialogTitle>
                <DialogDescription>Fill in the details to create a new Relationship Manager.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddRm)} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...register('firstName')} />
                        {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...register('lastName')} />
                        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adminId">Assign Admin</Label>
                     <Select onValueChange={(value) => control._formValues.adminId = value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an admin" />
                        </SelectTrigger>
                        <SelectContent>
                            {allAdmins.map(admin => (
                                <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {errors.adminId && <p className="text-sm text-destructive">{errors.adminId.message}</p>}
                </div>

                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!isValid}>Save RM</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

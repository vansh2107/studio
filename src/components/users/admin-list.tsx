'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Admin } from '@/lib/types';
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

const addAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['Active', 'Inactive']),
});
type AddAdminFormData = z.infer<typeof addAdminSchema>;


export function AdminList({ initialAdmins }: { initialAdmins: Admin[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      status: 'Active',
    }
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const handleAddAdmin = (data: AddAdminFormData) => {
    const newAdmin: Admin = {
      id: `admin-${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: 'ADMIN',
      avatarUrl: `https://avatar.vercel.sh/${data.email}.png`,
      superAdminId: currentUser?.id || 'sa-1', // Should come from current user context
    };
    setAdmins(prev => [...prev, newAdmin]);
    toast({ title: 'Success', description: 'Admin added successfully.' });
    setIsAddModalOpen(false);
    reset();
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Admin Management</h1>
        {isSuperAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Admin
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
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Fill in the details to create a new admin user.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddAdmin)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...register('firstName')} />
                        {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...register('lastName')} />
                        {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                     <Select onValueChange={(value) => control._formValues.status = value} defaultValue="Active">
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!isValid}>Save Admin</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


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
import { getAllAdmins, superAdmins as initialSuperAdmins } from '@/lib/mock-data';

const addAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['Active', 'Inactive']),
});
type AddAdminFormData = z.infer<typeof addAdminSchema>;

const addSuperAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type AddSuperAdminFormData = z.infer<typeof addSuperAdminSchema>;


export function AdminList({ initialAdmins }: { initialAdmins: Admin[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>(initialSuperAdmins);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isAddSuperAdminModalOpen, setIsAddSuperAdminModalOpen] = useState(false);
  const { toast } = useToast();

  const { register: registerAdmin, handleSubmit: handleAdminSubmit, reset: resetAdmin, control: controlAdmin, formState: { errors: adminErrors, isValid: isAdminValid } } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      status: 'Active',
    }
  });

  const { register: registerSuperAdmin, handleSubmit: handleSuperAdminSubmit, reset: resetSuperAdmin, formState: { errors: superAdminErrors, isValid: isSuperAdminValid } } = useForm<AddSuperAdminFormData>({
    resolver: zodResolver(addSuperAdminSchema),
    mode: 'onChange',
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
    setIsAddAdminModalOpen(false);
    resetAdmin();
  };

  const handleAddSuperAdmin = (data: AddSuperAdminFormData) => {
    const newSuperAdmin: SuperAdmin = {
      id: `sa-${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: 'SUPER_ADMIN',
      avatarUrl: `https://avatar.vercel.sh/${data.email}.png`,
    };
    setSuperAdmins(prev => [...prev, newSuperAdmin]);
    toast({ title: 'Success', description: 'Super Admin added successfully.' });
    setIsAddSuperAdminModalOpen(false);
    resetSuperAdmin();
  };


  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const allAdminUsers = [...superAdmins, ...admins];

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Admin Management</h1>
        {isSuperAdmin && (
            <div className='flex gap-2'>
                <Button onClick={() => setIsAddSuperAdminModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Super Admin
                </Button>
                <Button onClick={() => setIsAddAdminModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Admin
                </Button>
            </div>
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
      
      <Dialog open={isAddAdminModalOpen} onOpenChange={setIsAddAdminModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Fill in the details to create a new admin user.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdminSubmit(handleAddAdmin)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...registerAdmin('firstName')} />
                        {adminErrors.firstName && <p className="text-destructive text-sm">{adminErrors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...registerAdmin('lastName')} />
                        {adminErrors.lastName && <p className="text-destructive text-sm">{adminErrors.lastName.message}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...registerAdmin('email')} />
                    {adminErrors.email && <p className="text-destructive text-sm">{adminErrors.email.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                     <Select onValueChange={(value) => controlAdmin._formValues.status = value} defaultValue="Active">
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
                    <Button type="button" variant="outline" onClick={() => setIsAddAdminModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!isAdminValid}>Save Admin</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSuperAdminModalOpen} onOpenChange={setIsAddSuperAdminModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Super Admin</DialogTitle>
                <DialogDescription>Fill in the details to create a new SUPER admin user.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSuperAdminSubmit(handleAddSuperAdmin)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sa-firstName">First Name</Label>
                        <Input id="sa-firstName" {...registerSuperAdmin('firstName')} />
                        {superAdminErrors.firstName && <p className="text-destructive text-sm">{superAdminErrors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sa-lastName">Last Name</Label>
                        <Input id="sa-lastName" {...registerSuperAdmin('lastName')} />
                        {superAdminErrors.lastName && <p className="text-destructive text-sm">{superAdminErrors.lastName.message}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sa-email">Email</Label>
                    <Input id="sa-email" type="email" {...registerSuperAdmin('email')} />
                    {superAdminErrors.email && <p className="text-destructive text-sm">{superAdminErrors.email.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sa-password">Password</Label>
                    <Input id="sa-password" type="password" {...registerSuperAdmin('password')} />
                    {superAdminErrors.password && <p className="text-destructive text-sm">{superAdminErrors.password.message}</p>}
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddSuperAdminModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!isSuperAdminValid}>Save Super Admin</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

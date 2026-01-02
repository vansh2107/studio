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
import { getAllRMs } from '@/lib/mock-data';

const addAssociateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  rmId: z.string().min(1, 'Please assign an RM'),
});
type AddAssociateFormData = z.infer<typeof addAssociateSchema>;


export function AssociateList({ initialAssociates }: { initialAssociates: Associate[] }) {
  const { currentUser, canImpersonate, impersonate } = useCurrentUser();
  const [associates, setAssociates] = useState<Associate[]>(initialAssociates);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const allRms = getAllRMs();
  
  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm<AddAssociateFormData>({
    resolver: zodResolver(addAssociateSchema),
    mode: 'onChange',
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const handleAddAssociate = (data: AddAssociateFormData) => {
    const newAssociate: Associate = {
      id: `assoc-${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: 'ASSOCIATE',
      avatarUrl: `https://avatar.vercel.sh/${data.email}.png`,
      rmId: data.rmId,
    };
    setAssociates(prev => [...prev, newAssociate]);
    toast({ title: 'Success', description: 'Associate added successfully.' });
    setIsAddModalOpen(false);
    reset();
  };
  
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">Associate Management</h1>
             {isSuperAdmin && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Associate
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

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Associate</DialogTitle>
                <DialogDescription>Fill in the details to create a new associate.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddAssociate)} className="space-y-4">
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
                    <Label htmlFor="rmId">Assign RM</Label>
                     <Select onValueChange={(value) => control._formValues.rmId = value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an RM" />
                        </SelectTrigger>
                        <SelectContent>
                            {allRms.map(rm => (
                                <SelectItem key={rm.id} value={rm.id}>{rm.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {errors.rmId && <p className="text-destructive text-sm">{errors.rmId.message}</p>}
                </div>

                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!isValid}>Save Associate</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

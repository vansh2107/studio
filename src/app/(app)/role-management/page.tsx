
'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ROLES, PERMISSION_MODULES } from '@/lib/constants';
import type { Role } from '@/lib/types';


// Mock data for roles, simulating a local data store
const initialRoles: Role[] = [...ROLES];

const defaultPermissions = PERMISSION_MODULES.reduce((acc, module) => {
  acc[module] = { view: false, create: false, update: false, delete: false, export: false };
  return acc;
}, {} as any);


function AddRoleDialog({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name) return;
    onAdd(name.toUpperCase());
    setOpen(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>Create a new role to assign permissions to. This is only stored locally.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="role-name">Role Name</Label>
          <Input id="role-name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RoleManagementPage() {
  const { effectiveUser } = useCurrentUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const handleAddRole = (name: string) => {
    if (roles.some(role => role === name)) {
      toast({ title: 'Error', description: `Role "${name}" already exists.`, variant: 'destructive' });
      return;
    }
    setRoles(prev => [...prev, name as Role]);
    toast({ title: 'Success', description: `Role "${name}" created (locally).` });
  };

  const handleDeleteRole = (roleToDelete: Role) => {
    if (roleToDelete === 'SUPER_ADMIN') {
      toast({ title: 'Error', description: 'Cannot delete SUPER_ADMIN role.', variant: 'destructive' });
      return;
    }
    setRoles(prev => prev.filter(role => role !== roleToDelete));
    toast({ title: 'Success', description: `Role "${roleToDelete}" deleted (locally).` });
  };

  const canManage = effectiveUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Role Management</h1>
          <p className="text-muted-foreground">Define roles and manage their permissions across the application.</p>
        </div>
        {canManage && <AddRoleDialog onAdd={handleAddRole} />}
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.sort((a, b) => a.localeCompare(b)).map((role) => (
                <TableRow key={role}>
                  <TableCell className="font-medium">{role}</TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/role-management/${role}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={role === 'SUPER_ADMIN'}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the <strong>{role}</strong> role.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRole(role)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
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

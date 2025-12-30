'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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
import { Skeleton } from '@/components/ui/skeleton';
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
import { useState, useMemo } from 'react';
import { RoleData } from '@/lib/types';

const defaultPermissions = {
  SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
  ADMIN: { view: false, create: false, update: false, delete: false, export: false },
  ASSOCIATE: { view: false, create: false, update: false, delete: false, export: false },
  CUSTOMER: { view: false, create: false, update: false, delete: false, export: false },
  FAMILY_MANAGER: { view: false, create: false, update: false, delete: false, export: false },
  DOC_VAULT: { view: false, create: false, update: false, delete: false, export: false },
};

function AddRoleDialog({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setIsSaving(true);
    await onAdd(name);
    setIsSaving(false);
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
          <DialogDescription>Create a new role to assign permissions to.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="role-name">Role Name</Label>
          <Input id="role-name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RoleManagementPage() {
  const { effectiveUser } = useCurrentUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();

  const rolesCollection = useMemo(() => db ? collection(db, 'roles') : null, [db]);
  const { data: roles, loading, error } = useCollection<RoleData>(rolesCollection);

  const handleAddRole = async (name: string) => {
    if (!db) return;
    try {
      const docRef = await addDoc(collection(db, 'roles'), { name });
      await addDoc(collection(db, 'permissions'), { roleId: docRef.id, ...defaultPermissions });
      toast({ title: 'Success', description: `Role "${name}" created.` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not create role.', variant: 'destructive' });
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!db || roleName === 'SUPER_ADMIN') {
      toast({ title: 'Error', description: 'Cannot delete SUPER_ADMIN role.', variant: 'destructive' });
      return;
    }
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'roles', roleId));
      batch.delete(doc(db, 'permissions', roleId));
      await batch.commit();

      toast({ title: 'Success', description: `Role "${roleName}" deleted.` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Could not delete role.', variant: 'destructive' });
    }
  };


  if (effectiveUser?.role !== 'SUPER_ADMIN') {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Role Management</h1>
        <AddRoleDialog onAdd={handleAddRole} />
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
              {loading && (
                <>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                  </TableRow>
                </>
              )}
              {!loading && roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/role-management/${role.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={role.name === 'SUPER_ADMIN'}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the <strong>{role.name}</strong> role.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRole(role.id, role.name)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {error && <p className='p-4 text-destructive'>{error.message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

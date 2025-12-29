'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getRoles, users } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PERMISSIONS } from '@/lib/constants';
import { RoleData, Role } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';


function RoleEditor({ role, onSave, children }: { role?: RoleData, onSave: (data: RoleData) => void, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState(role?.name || '');
  const [selectedPermissions, setSelectedPermissions] = useState(role?.permissions || []);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    );
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedPermissions(checked ? [...PERMISSIONS] : []);
  }

  const handleSave = () => {
    onSave({ name: roleName as Role, permissions: selectedPermissions });
    setOpen(false);
  };

  const isAllSelected = selectedPermissions.length === PERMISSIONS.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {role ? `Editing permissions for ${role.name}.` : 'Create a new role and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Role Name</Label>
            <Input id="name" value={roleName} onChange={e => setRoleName(e.target.value)} className="col-span-3" disabled={!!role} />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="flex items-center space-x-2 p-2 rounded-md bg-card">
              <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={handleSelectAll} />
              <Label htmlFor="select-all" className="font-bold">Select All</Label>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 rounded-md bg-card">
              {PERMISSIONS.map(permission => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox 
                    id={permission} 
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                  />
                  <Label htmlFor={permission}>{permission}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function RoleManagementPage() {
  const { effectiveUser } = useCurrentUser();
  const [roles, setRoles] = useState(getRoles());
  const { toast } = useToast();

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

  const isRoleInUse = (roleName: Role) => users.some(user => user.role === roleName);

  const handleSaveRole = (data: RoleData) => {
    setRoles(prev => {
      const existing = prev.find(r => r.name === data.name);
      if (existing) {
        return prev.map(r => r.name === data.name ? data : r);
      }
      return [...prev, data];
    });
    toast({ title: "Success", description: `Role "${data.name}" has been saved.` });
  };
  
  const handleDeleteRole = (roleName: Role) => {
    setRoles(prev => prev.filter(r => r.name !== roleName));
    toast({ title: "Success", description: `Role "${roleName}" has been deleted.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Role Management</h1>
          <p className="text-muted-foreground">Define roles and their permissions across the application.</p>
        </div>
        <RoleEditor onSave={handleSaveRole}>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Role</Button>
        </RoleEditor>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.name}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                      {role.permissions.length === 0 && <span className="text-muted-foreground text-xs">No permissions</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {role.name !== 'SUPER_ADMIN' ? (
                      <div className="flex gap-2 justify-end">
                        <RoleEditor role={role} onSave={handleSaveRole}>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </RoleEditor>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isRoleInUse(role.name)}>
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
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteRole(role.name)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not editable</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </Body>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

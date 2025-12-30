'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc } from '@/firebase';
import { collection, doc, setDoc, getFirestore, writeBatch } from 'firebase/firestore';
import { PERMISSIONS, PERMISSION_MODULES, ROLES, type Permission, type Role, type PermissionModule, type Permissions } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function RoleManagementPage() {
  const { effectiveUser } = useCurrentUser();
  const db = getFirestore();
  const permissionsCollectionRef = collection(db, 'permissions');
  const { data: permissionsData, loading, error } = useCollection(permissionsCollectionRef);
  const { toast } = useToast();
  
  const [permissions, setPermissions] = useState<Record<Role, Permissions>>({} as Record<Role, Permissions>);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (permissionsData) {
      const newPermissions = {} as Record<Role, Permissions>;
      permissionsData.forEach(doc => {
        newPermissions[doc.id as Role] = doc.data() as Permissions;
      });
      setPermissions(newPermissions);
    }
  }, [permissionsData]);


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
  
  const handlePermissionChange = async (role: Role, module: PermissionModule, permission: Permission, checked: boolean) => {
    if (role === 'SUPER_ADMIN') return; // SUPER_ADMIN permissions cannot be changed

    const updatedPermissions = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [module]: {
          ...permissions[role][module],
          [permission]: checked
        }
      }
    };
    setPermissions(updatedPermissions);

    setIsSaving(true);
    try {
      const roleDocRef = doc(db, 'permissions', role);
      await setDoc(roleDocRef, { [module]: { [permission]: checked } }, { merge: true });
      toast({
        title: 'Permission Updated',
        description: `Successfully updated ${permission} permission for ${role} in ${module}.`,
      });
    } catch (e) {
      console.error("Error updating permission: ", e);
      toast({
        title: 'Error',
        description: 'Failed to update permission.',
        variant: 'destructive',
      });
      // Revert optimistic update on failure
      setPermissions(permissions);
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionValue = (role: Role, module: PermissionModule, permission: Permission): boolean => {
    return permissions[role]?.[module]?.[permission] ?? false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Role Permission Matrix</h1>
        <p className="text-muted-foreground">
          Manage permissions for each role across different modules.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] font-bold sticky left-0 bg-card">Role</TableHead>
                  {PERMISSION_MODULES.map((module) => (
                    <TableHead key={module} colSpan={PERMISSIONS.length} className="text-center">
                      {module}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card"></TableHead>
                  {PERMISSION_MODULES.map((module) =>
                    PERMISSIONS.map((permission) => (
                      <TableHead key={`${module}-${permission}`} className="text-center capitalize w-[100px]">
                        {permission}
                      </TableHead>
                    ))
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && Array.from({length: ROLES.length}).map((_, rowIndex) => (
                   <TableRow key={rowIndex}>
                      <TableCell className="font-medium sticky left-0 bg-card">
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                       {PERMISSION_MODULES.flatMap(module => PERMISSIONS.map(permission => (
                        <TableCell key={`${module}-${permission}`} className="text-center">
                           <Skeleton className="h-5 w-5 mx-auto" />
                        </TableCell>
                      )))}
                   </TableRow>
                ))}

                {!loading && ROLES.map((role) => (
                  <TableRow key={role}>
                    <TableCell className="font-medium sticky left-0 bg-card">{role}</TableCell>
                    {PERMISSION_MODULES.map((module) =>
                      PERMISSIONS.map((permission) => (
                        <TableCell key={`${role}-${module}-${permission}`} className="text-center">
                          <Checkbox
                            disabled={role === 'SUPER_ADMIN' || isSaving}
                            checked={getPermissionValue(role, module, permission)}
                            onCheckedChange={(checked) => {
                              handlePermissionChange(role, module, permission, !!checked)
                            }}
                          />
                        </TableCell>
                      ))
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

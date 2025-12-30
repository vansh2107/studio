'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter, useParams } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PERMISSION_MODULES, PERMISSIONS, type Permission, type PermissionModule, type Permissions, type Role } from '@/lib/constants';
import { RoleData } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditRolePage() {
  const { effectiveUser } = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const roleId = params.roleId as string;
  
  const db = useFirestore();
  const { toast } = useToast();

  const roleDocRef = useMemo(() => (db && roleId) ? doc(db, 'roles', roleId) : null, [db, roleId]);
  const { data: roleData, loading: roleLoading } = useDoc<RoleData>(roleDocRef);
  
  const permissionsDocRef = useMemo(() => (db && roleId) ? doc(db, 'permissions', roleId) : null, [db, roleId]);
  const { data: permissions, loading: permissionsLoading } = useDoc<Permissions>(permissionsDocRef);

  const [localPermissions, setLocalPermissions] = useState<Permissions | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (permissions) {
      setLocalPermissions(permissions);
    }
  }, [permissions]);
  
  const handlePermissionChange = async (module: PermissionModule, permission: Permission, checked: boolean) => {
    if (roleData?.name === 'SUPER_ADMIN' || !db || !localPermissions) return;

    const newPermissions = { 
      ...localPermissions,
      [module]: {
        ...localPermissions[module],
        [permission]: checked,
      }
    };
    setLocalPermissions(newPermissions);

    setIsSaving(true);
    try {
      await setDoc(permissionsDocRef, { [module]: { [permission]: checked } }, { merge: true });
      toast({
        title: 'Permission updated',
        description: `"${module}" -> "${permission}" set to ${checked}.`,
      });
    } catch (e) {
      console.error("Error updating permission: ", e);
      setLocalPermissions(permissions); // Revert on error
      toast({
        title: 'Error',
        description: 'Failed to update permission.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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

  const loading = roleLoading || permissionsLoading;
  const currentPermissions = localPermissions || permissions;

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Role Management
      </Button>
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Permissions for {loading ? <Skeleton className="h-8 w-32 inline-block" /> : <code>{roleData?.name}</code>}
        </h1>
        <p className="text-muted-foreground">
          Manage permissions for the <strong>{roleData?.name}</strong> role. Changes are saved automatically.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] font-bold">Modules</TableHead>
                  {PERMISSIONS.map(permission => (
                    <TableHead key={permission} className="text-center capitalize font-bold">{permission}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && PERMISSION_MODULES.map(module => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{module.replace(/_/g, ' ')}</TableCell>
                    {PERMISSIONS.map(permission => (
                      <TableCell key={permission} className="text-center">
                        <Skeleton className="h-4 w-4 mx-auto" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {!loading && currentPermissions && PERMISSION_MODULES.map(module => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{module.replace(/_/g, ' ')}</TableCell>
                    {PERMISSIONS.map(permission => (
                      <TableCell key={permission} className="text-center">
                        <Checkbox
                          disabled={isSaving || roleData?.name === 'SUPER_ADMIN'}
                          checked={currentPermissions[module]?.[permission] ?? false}
                          onCheckedChange={(checked) => {
                            handlePermissionChange(module, permission, !!checked);
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           {!loading && !currentPermissions && <p className="p-4 text-center text-muted-foreground">No permission set found for this role.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

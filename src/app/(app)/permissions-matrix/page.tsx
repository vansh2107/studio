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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { PERMISSIONS, PERMISSION_MODULES, ROLES, type Permission, type Role, type PermissionModule, type Permissions } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const DEFAULT_PERMISSIONS: Permissions = {
  'Admin Modules': { view: true, edit: true, delete: false, download: false },
  'Associates': { view: true, edit: true, delete: false, download: false },
  'Customers': { view: true, edit: true, delete: false, download: false },
  'Whole Family': { view: true, edit: false, delete: false, download: false },
  'EditCustomers': true,
  'DeleteCascade': false,
  'DownloadPDF': true,
};

const SUPER_ADMIN_PERMISSIONS: Permissions = {
  'Admin Modules': { view: true, edit: true, delete: true, download: true },
  'Associates': { view: true, edit: true, delete: true, download: true },
  'Customers': { view: true, edit: true, delete: true, download: true },
  'Whole Family': { view: true, edit: true, delete: true, download: true },
  'EditCustomers': true,
  'DeleteCascade': true,
  'DownloadPDF': true,
};


export default function RoleManagementPage() {
  const { effectiveUser } = useCurrentUser();
  const db = useFirestore();
  const { toast } = useToast();

  const permissionsCollectionRef = useMemo(() => db ? collection(db, 'permissions') : null, [db]);
  const { data: permissionsData, loading, error } = useCollection(permissionsCollectionRef);
  
  const [permissions, setPermissions] = useState<Record<Role, Permissions>>({} as Record<Role, Permissions>);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializePermissions = useCallback(async () => {
    if (!db) return;
    setIsInitializing(true);
    toast({
      title: 'Initializing Permissions',
      description: 'No permissions found. Setting up default roles...',
    });
    try {
      const batch = writeBatch(db);
      ROLES.forEach(role => {
        const roleDocRef = doc(db, 'permissions', role);
        const defaultData = role === 'SUPER_ADMIN' ? SUPER_ADMIN_PERMISSIONS : DEFAULT_PERMISSIONS;
        batch.set(roleDocRef, defaultData);
      });
      await batch.commit();
      toast({
        title: 'Initialization Complete',
        description: 'Default permissions have been set.',
      });
    } catch (e) {
      console.error("Error initializing permissions: ", e);
      toast({
        title: 'Initialization Error',
        description: 'Could not set up default permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  }, [db, toast]);
  
  useEffect(() => {
    if (!loading && permissionsData && permissionsData.length === 0 && !isInitializing) {
        if(db) initializePermissions();
    } else if (permissionsData) {
      const newPermissions = {} as Record<Role, Permissions>;
      permissionsData.forEach(pDoc => {
        newPermissions[pDoc.id as Role] = pDoc as Permissions;
      });
      setPermissions(newPermissions);
    }
  }, [permissionsData, loading, db, initializePermissions, isInitializing]);


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
  
  const handlePermissionChange = async (role: Role, module: PermissionModule | keyof Omit<Permissions, PermissionModule>, permission?: Permission, checked?: boolean) => {
    if (role === 'SUPER_ADMIN' || !db) return;

    // Create a deep copy to avoid direct state mutation
    const updatedPermissions = JSON.parse(JSON.stringify(permissions));
    
    let updatePayload: any;

    if (permission) { // It's a nested module permission
        updatedPermissions[role][module as PermissionModule][permission] = checked;
        updatePayload = { [`${module}.${permission}`]: checked };
    } else { // It's a root-level permission
        updatedPermissions[role][module as keyof Omit<Permissions, PermissionModule>] = checked;
        updatePayload = { [module]: checked };
    }

    setPermissions(updatedPermissions); // Optimistic update
    setIsSaving(true);
    
    try {
      const roleDocRef = doc(db, 'permissions', role);
      await setDoc(roleDocRef, updatePayload, { merge: true });
      toast({
        title: 'Permission Updated',
        description: `Successfully updated permission for ${role}.`,
      });
    } catch (e) {
      console.error("Error updating permission: ", e);
      toast({
        title: 'Error',
        description: 'Failed to update permission.',
        variant: 'destructive',
      });
       // Revert optimistic update on failure
      const revertedPermissions = JSON.parse(JSON.stringify(permissions));
      if (permission) {
        revertedPermissions[role][module as PermissionModule][permission] = !checked;
      } else {
        revertedPermissions[role][module as keyof Omit<Permissions, PermissionModule>] = !checked;
      }
      setPermissions(revertedPermissions);
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionValue = (role: Role, module: PermissionModule | keyof Omit<Permissions, PermissionModule>, permission?: Permission): boolean => {
      if (!permissions[role]) return false;
      if (permission) {
          const mod = permissions[role][module as PermissionModule];
          return mod ? mod[permission] ?? false : false;
      }
      const perm = permissions[role][module as keyof Omit<Permissions, PermissionModule>];
      return typeof perm === 'boolean' ? perm : false;
  };
  
  const singleActionPermissions: (keyof Omit<Permissions, PermissionModule>)[] = ['EditCustomers', 'DeleteCascade', 'DownloadPDF'];


  const renderSkeletons = () => (
      ROLES.map((role) => (
         <TableRow key={role}>
            <TableCell className="font-medium sticky left-0 bg-card z-10">
              <Skeleton className="h-5 w-24" />
            </TableCell>
             {[...PERMISSION_MODULES.flatMap(m => PERMISSIONS.map(p => `${m}-${p}`)), ...singleActionPermissions].map(key => (
              <TableCell key={`${role}-${key}`} className="text-center">
                 <Skeleton className="h-5 w-5 mx-auto" />
              </TableCell>
            ))}
         </TableRow>
      ))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Role Permission Matrix</h1>
        <p className="text-muted-foreground">
          Manage permissions for each role across different modules. Changes are saved automatically.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] font-bold sticky left-0 bg-card z-10">Role</TableHead>
                  {PERMISSION_MODULES.map((module) => (
                    <TableHead key={module} colSpan={PERMISSIONS.length} className="text-center border-l">
                      {module}
                    </TableHead>
                  ))}
                  <TableHead colSpan={singleActionPermissions.length} className="text-center border-l">
                      Other Actions
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10"></TableHead>
                  {PERMISSION_MODULES.map((module) =>
                    PERMISSIONS.map((permission) => (
                      <TableHead key={`${module}-${permission}`} className="text-center capitalize w-[100px] border-l">
                        {permission}
                      </TableHead>
                    ))
                  )}
                  {singleActionPermissions.map((permission) => (
                      <TableHead key={permission} className="text-center capitalize w-[100px] border-l">
                        {permission.replace(/([A-Z])/g, ' $1').trim()}
                      </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(loading || isInitializing) && Object.keys(permissions).length === 0 && renderSkeletons()}

                {!loading && !isInitializing && Object.keys(permissions).length > 0 && ROLES.map((role) => (
                  <TableRow key={role}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10">{role}</TableCell>
                    {PERMISSION_MODULES.map((module) =>
                      PERMISSIONS.map((permission) => (
                        <TableCell key={`${role}-${module}-${permission}`} className="text-center border-l">
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
                    {singleActionPermissions.map(permission => (
                         <TableCell key={`${role}-${permission}`} className="text-center border-l">
                          <Checkbox
                            disabled={role === 'SUPER_ADMIN' || isSaving}
                            checked={getPermissionValue(role, permission)}
                            onCheckedChange={(checked) => {
                              handlePermissionChange(role, permission, undefined, !!checked)
                            }}
                          />
                        </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!loading && Object.keys(permissions).length === 0 && !isInitializing && (
                <div className="p-8 text-center text-muted-foreground">
                    No permissions found.
                    <Button onClick={initializePermissions} variant="link">Initialize default permissions.</Button>
                </div>
            )}
             {error && (
              <div className="p-8 text-center text-destructive">
                Error loading permissions: {error.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter, useParams } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { PERMISSION_MODULES, PERMISSIONS, type Permission, type PermissionModule, type Permissions } from '@/lib/constants';
import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data store for permissions
const mockPermissionsStore: Record<string, Permissions> = {
  SUPER_ADMIN: {
    SUPER_ADMIN: { view: true, create: true, update: true, delete: true, export: true },
    ADMIN: { view: true, create: true, update: true, delete: true, export: true },
    ASSOCIATE: { view: true, create: true, update: true, delete: true, export: true },
    CUSTOMER: { view: true, create: true, update: true, delete: true, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: true, export: true },
    DOC_VAULT: { view: true, create: true, update: true, delete: true, export: true },
  },
  ADMIN: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: true, create: true, update: true, delete: false, export: true },
    ASSOCIATE: { view: true, create: true, update: true, delete: true, export: false },
    CUSTOMER: { view: true, create: true, update: true, delete: true, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: false, export: true },
    DOC_VAULT: { view: true, create: true, update: false, delete: false, export: true },
  },
  ASSOCIATE: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ASSOCIATE: { view: true, create: false, update: true, delete: false, export: false },
    CUSTOMER: { view: true, create: true, update: true, delete: false, export: true },
    FAMILY_MANAGER: { view: true, create: false, update: true, delete: false, export: false },
    DOC_VAULT: { view: true, create: true, update: false, delete: false, export: false },
  },
  CUSTOMER: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ASSOCIATE: { view: false, create: false, update: false, delete: false, export: false },
    CUSTOMER: { view: true, create: false, update: false, delete: false, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: true, export: false },
    DOC_VAULT: { view: true, create: true, update: true, delete: true, export: true },
  },
};


export default function EditRolePage() {
  const { effectiveUser } = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const roleId = decodeURIComponent(params.roleId as string); // Role name is the ID
  
  const { toast } = useToast();
  
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    // Simulate fetching data
    const fetchedPermissions = mockPermissionsStore[roleId];
    if (fetchedPermissions) {
      setPermissions(JSON.parse(JSON.stringify(fetchedPermissions))); // Deep copy
    }
  }, [roleId]);
  
  const handlePermissionChange = (module: PermissionModule, permission: Permission, checked: boolean) => {
    if (roleId === 'SUPER_ADMIN' || !permissions) return;

    const newPermissions = { 
      ...permissions,
      [module]: {
        ...permissions[module],
        [permission]: checked,
      }
    };
    setPermissions(newPermissions);

    // In a real app, this is where you'd save to Firestore.
    // For the prototype, we just update the local mock store.
    mockPermissionsStore[roleId] = newPermissions;

    toast({
      title: 'Permission updated (local)',
      description: `"${module}" -> "${permission}" set to ${checked}.`,
    });
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
       <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Role Management
      </Button>
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Permissions for <code>{roleId}</code>
        </h1>
        <p className="text-muted-foreground">
          Manage permissions for the <strong>{roleId}</strong> role. Changes are saved locally for this prototype.
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
                {permissions && PERMISSION_MODULES.map(module => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{module.replace(/_/g, ' ')}</TableCell>
                    {PERMISSIONS.map(permission => (
                      <TableCell key={permission} className="text-center">
                        <Checkbox
                          disabled={roleId === 'SUPER_ADMIN'}
                          checked={permissions[module]?.[permission] ?? false}
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
           {!permissions && <p className="p-4 text-center text-muted-foreground">No permission set found for this role.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

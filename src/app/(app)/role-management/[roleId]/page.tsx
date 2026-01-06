
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
import { permissions as mockPermissionsStore } from '@/lib/mock-data';


export default function EditRolePage() {
  const { effectiveUser } = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const roleId = decodeURIComponent(params.roleId as string);
  
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

    let newModulePermissions = {
      ...(permissions[module] || {}),
      [permission]: checked,
    };

    // If 'view' is unchecked, uncheck and disable all others for that module
    if (permission === 'view' && !checked) {
      PERMISSIONS.forEach(p => {
        if (p !== 'view') {
          newModulePermissions[p] = false;
        }
      });
    }

    const newPermissions = { 
      ...permissions,
      [module]: newModulePermissions,
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

  const moduleDisplayNames: Record<PermissionModule, string> = {
    SUPER_ADMIN: 'Super-admin',
    ADMIN: 'Admin',
    RM: 'RM',
    ASSOCIATE: 'Associate',
    CUSTOMER: 'Client',
    DOC_VAULT: 'Doc Vault',
    TASK: 'Task',
    CHATBOT: 'Chat-bot',
    CUSTOMER_ACTIONS: 'View / Impersonate / Edit / Delete / Create New Family (Client page actions)'
  };


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
                  <TableHead className="w-[400px] font-bold">Modules</TableHead>
                  {PERMISSIONS.map(permission => (
                    <TableHead key={permission} className="text-center capitalize font-bold">{permission}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions && PERMISSION_MODULES.map(module => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{moduleDisplayNames[module]}</TableCell>
                    {PERMISSIONS.map(permission => {
                      const canView = permissions[module]?.view ?? false;
                      const isViewCheckbox = permission === 'view';
                      
                      return (
                        <TableCell key={permission} className="text-center">
                          <Checkbox
                            disabled={roleId === 'SUPER_ADMIN' || (!isViewCheckbox && !canView)}
                            checked={permissions[module]?.[permission] ?? false}
                            onCheckedChange={(checked) => {
                              handlePermissionChange(module, permission, !!checked);
                            }}
                          />
                        </TableCell>
                      );
                    })}
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

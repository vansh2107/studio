'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getAllAdmins } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminList } from '@/components/users/admin-list';

export default function AdminsPage() {
  const { hasPermission } = useCurrentUser();
  const admins = getAllAdmins();

  if (!hasPermission('ADMIN', 'view')) {
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

  return <AdminList initialAdmins={admins} />;
}

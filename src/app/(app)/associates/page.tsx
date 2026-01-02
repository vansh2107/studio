'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssociateList } from '@/components/users/associate-list';


export default function AssociatesPage() {
  const { associates, hasPermission } = useCurrentUser();

  const canViewPage = hasPermission('ASSOCIATE', 'view');

  if (!canViewPage) {
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

  return <AssociateList initialAssociates={associates} />;
}

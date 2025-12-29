'use client';

import SuperAdminDashboard from '@/components/dashboards/super-admin-dashboard';
import AdminDashboard from '@/components/dashboards/admin-dashboard';
import AssociateDashboard from '@/components/dashboards/associate-dashboard';
import CustomerDashboard from '@/components/dashboards/customer-dashboard';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { effectiveUser } = useCurrentUser();

  if (!effectiveUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-80 col-span-4" />
          <Skeleton className="h-80 col-span-3" />
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (effectiveUser.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'ADMIN':
        return <AdminDashboard user={effectiveUser} />;
      case 'ASSOCIATE':
        return <AssociateDashboard user={effectiveUser} />;
      case 'CUSTOMER':
        return <CustomerDashboard user={effectiveUser} />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return <div className="space-y-6">{renderDashboard()}</div>;
}

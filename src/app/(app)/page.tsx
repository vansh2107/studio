
'use client';

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

  // Always render the unified CustomerDashboard, passing the effectiveUser to it.
  return <div className="space-y-6"><CustomerDashboard user={effectiveUser} /></div>;
}

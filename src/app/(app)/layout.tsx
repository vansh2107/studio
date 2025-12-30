import { AppLayout } from '@/components/layout/app-layout';
import { UserProvider } from '@/hooks/use-current-user';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <AppLayout>{children}</AppLayout>
    </UserProvider>
  );
}

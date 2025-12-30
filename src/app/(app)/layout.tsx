import { AppLayout } from '@/components/layout/app-layout';
import FirebaseClientProvider from '@/firebase/client-provider';
import { UserProvider } from '@/hooks/use-current-user';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <UserProvider>
        <AppLayout>{children}</AppLayout>
      </UserProvider>
    </FirebaseClientProvider>
  );
}

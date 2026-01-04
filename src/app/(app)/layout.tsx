'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Chatbot } from '@/components/tasks/chatbot';
import { useCurrentUser } from '@/hooks/use-current-user';
import { TaskProvider } from '@/hooks/use-tasks';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useCurrentUser();
  return (
    <TaskProvider>
      <AppLayout isLoading={isLoading}>{children}</AppLayout>
      <Chatbot />
    </TaskProvider>
  );
}

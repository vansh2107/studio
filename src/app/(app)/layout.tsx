'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Chatbot } from '@/components/tasks/chatbot';
import { TaskProvider } from '@/hooks/use-tasks';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TaskProvider>
      <AppLayout>{children}</AppLayout>
      <Chatbot />
    </TaskProvider>
  );
}


'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function AppLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-white px-4 shadow-sm sm:px-6">
        <Skeleton className="h-8 w-8 md:hidden" />
        <div className="flex items-center">
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </header>
      <div className="flex">
        <aside
          className={cn(
            'hidden md:flex flex-col z-30 bg-gradient-to-b from-[#C96A09] via-[#E38B19] to-[#8fb9ff] text-white transition-all duration-300 ease-in-out',
            'sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-200/20',
            'w-64'
          )}
        >
          <div className="flex w-full items-center justify-end p-3">
            <Skeleton className="h-7 w-7" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
            <div className="flex w-full min-w-0 flex-col gap-1">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col overflow-y-auto h-[calc(100vh-3.5rem)]">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
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
            </div>
          </div>
          <footer className="w-full text-center text-sm text-muted-foreground py-4 border-t bg-muted">
            © FinArray — All rights reserved
          </footer>
        </main>
      </div>
    </div>
  );
}

export function AppLayout({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <AppLayoutSkeleton />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex">
          <AppSidebar />
          <main className="flex flex-1 flex-col overflow-y-auto h-[calc(100vh-3.5rem)]">
             <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto w-full max-w-7xl">{children}</div>
             </div>
             <footer className="w-full text-center text-sm text-muted-foreground py-4 border-t bg-muted">
                © FinArray — All rights reserved
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

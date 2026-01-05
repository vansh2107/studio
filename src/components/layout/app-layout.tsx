
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function MainContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        'flex flex-1 flex-col transition-all duration-300 ease-in-out',
        'md:ml-64 data-[state=collapsed]:md:ml-14'
      )}
      data-state={state}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
      <footer className="w-full text-center text-sm text-muted-foreground py-4 border-t mt-8">
        © Ascend Wealth — All rights reserved
      </footer>
    </div>
  );
}

function AppLayoutSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-card px-4 sm:h-16 sm:px-6">
        <div className="flex-1"></div>
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </header>
      <div className="flex flex-1">
        <div className="hidden md:flex flex-col z-30 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out w-64 p-2">
          <div className="flex items-center justify-between gap-2 p-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-7 w-7" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
            <div className="flex w-full min-w-0 flex-col gap-1">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col md:pl-64">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
          </main>
          <footer className="w-full text-center text-sm text-muted-foreground py-4 border-t mt-8">
            © Ascend Wealth — All rights reserved
          </footer>
        </div>
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
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <MainContent>{children}</MainContent>
        </div>
      </div>
    </SidebarProvider>
  );
}

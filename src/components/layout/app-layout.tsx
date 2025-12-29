import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <AppSidebar />
        <div className="flex flex-col md:pl-[var(--sidebar-width-icon)] group-data-[collapsible=icon]:md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-200 ease-linear">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

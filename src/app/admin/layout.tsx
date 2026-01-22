import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { CommandMenu } from "@/components/admin/command-menu";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { Suspense } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // NOTE: We intentionally avoid awaiting server-side auth here to prevent
  // prerender-time uncached data access which can break production builds.
  // Authentication checks are performed at runtime (client or API) instead.
  return (
    <SidebarProvider>
      <Suspense fallback={<div />}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Suspense fallback={<div />}>
            <Breadcrumbs />
          </Suspense>
          {children}
        </div>
      </SidebarInset>
      <Suspense fallback={<div />}>
        <CommandMenu />
      </Suspense>
    </SidebarProvider>
  );
}

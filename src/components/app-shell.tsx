import type { ReactNode } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">
              Wise AI Workplace Assistant
            </span>
            <div className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
              AI-generated content may require human review.
            </div>
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}

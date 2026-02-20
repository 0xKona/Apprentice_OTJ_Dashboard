"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";

Amplify.configure(outputs);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <main className="flex-1 p-2">
        <div className="h-full rounded-xl border bg-background p-6 overflow-auto">
          <SidebarTrigger className="mb-4" />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

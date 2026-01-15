"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

Amplify.configure(outputs);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </AuthGuard>
  );
}

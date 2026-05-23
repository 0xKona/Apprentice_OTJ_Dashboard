"use client";

import { Amplify } from "aws-amplify";
import { amplifyConfig } from "@/lib/amplify-config";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { Footer } from "@/components/footer";

Amplify.configure(amplifyConfig);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <main className="flex-1 p-2 flex flex-col">
        <div className="flex-1 rounded-xl border bg-background p-6 overflow-auto">
          <SidebarTrigger className="mb-4" />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

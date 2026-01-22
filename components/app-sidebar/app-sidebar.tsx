import { Home, Upload, FileText, Download, Settings, Logs } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Ingest Existing Logs",
    url: "/dashboard/ingest",
    icon: Upload,
  },
  {
    title: "View / Add / Edit Logs",
    url: "/dashboard/logs",
    icon: FileText,
  },
  {
    title: "Export Logs",
    url: "/dashboard/export",
    icon: Download,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          {/* <Logs className="h-8 w-8" /> */}
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Logs className="h-6 w-6" />
              OTJobber
            </h1>
            <p className="text-xs text-muted-foreground">
              Apprenticeship Learning Log Management Platform
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((navItem) => (
              <SidebarMenuItem key={navItem.title}>
                <SidebarMenuButton asChild>
                  <Link href={navItem.url}>
                    <navItem.icon />
                    <span>{navItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2 p-2">
          <ThemeToggle />
          <Separator />
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

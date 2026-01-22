import { Logs } from "lucide-react";
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
import ProfileCard from "./profile-card";
import { Separator } from "../ui/separator";
import { NavItem, navItems } from "@/lib/nav-items";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
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
            {navItems.map((navItem: NavItem) => (
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
          <Separator />
          <ProfileCard />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

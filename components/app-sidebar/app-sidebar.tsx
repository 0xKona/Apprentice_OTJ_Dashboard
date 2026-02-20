import Link from "next/link";
import Image from "next/image";

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
        <div className="px-1 py-3 space-y-1">
          <Image
            src="/logo_full.svg"
            alt="OTJobber"
            width={220}
            height={60}
            priority
          />
          <p className="text-xs text-muted-foreground pl-1">
            On-the-job learning log platform
          </p>
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

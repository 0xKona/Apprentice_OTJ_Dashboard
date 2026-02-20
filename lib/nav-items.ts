import {
  Home,
  Upload,
  FileText,
  Download,
  Settings,
} from "lucide-react";

export interface NavItem {
    title: string;
    url: string;
    icon: typeof Home;
}

export const navItems: NavItem[] = [
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
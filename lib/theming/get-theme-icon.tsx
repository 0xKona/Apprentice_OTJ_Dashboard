import { Monitor, Moon, Sun } from "lucide-react";

export function getThemeIcon(theme: string | undefined) {
  switch (theme) {
    case "light":
      return <Sun className="h-4 w-4" />;
    case "dark":
      return <Moon className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

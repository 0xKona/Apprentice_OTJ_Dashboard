"use client";

import { useState, useEffect } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, Monitor, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getThemeIcon } from "@/lib/theming/get-theme-icon";
import { handleSignOut } from "@/lib/auth";

export default function ProfileCard() {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setEmail(attributes.email || null);
      } catch (error) {
        console.error("Error fetching user attributes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserEmail();
  }, []);

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        {/* Card Displayed in Sidebar */}
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-6 h-auto hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-start gap-1 text-left">
              <span className="text-xs text-muted-foreground">
                You are signed in as
              </span>
              <span className="text-sm font-medium truncate max-w-45">
                {email || "Loading..."}
              </span>
            </div>
            <ChevronUp className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        {/* Card Menu */}
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {getThemeIcon(theme)}
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="size-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="size-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="size-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Sign-out Button */}
          <DropdownMenuItem
            onClick={() => setShowSignOutDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to sign out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and will need to sign in
              again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => handleSignOut(router)}
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

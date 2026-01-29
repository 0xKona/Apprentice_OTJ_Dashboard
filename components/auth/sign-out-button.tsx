"use client";

import { signOut } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full justify-start"
    >
      <LogOut />
      <span>Sign Out</span>
    </Button>
  );
}

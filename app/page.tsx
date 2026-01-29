"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8">
      <div className="fixed bottom-4 left-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">OTJ Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Apprentice On-The-Job Training Management System
          </p>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Manage and track apprentice training progress, log on-the-job hours,
            and generate comprehensive reports.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">Create Account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

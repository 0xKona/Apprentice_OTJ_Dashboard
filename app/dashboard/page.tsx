"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function DashboardPage() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  const isLoading = authStatus === "configuring";
  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your OTJ Dashboard</p>
    </div>
  );
}

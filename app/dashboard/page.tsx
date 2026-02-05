"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useAuth } from "@/hooks/use-auth";
import { useTrainingLogsStore } from "@/lib/stores/training-logs-store";
import { HoursChart } from "@/components/dashboard/hours-chart";
import { TotalHours } from "@/components/dashboard/total-hours";
import { RecentLogs } from "@/components/dashboard/recent-logs";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { logs, fetchLogs } = useTrainingLogsStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, fetchLogs]);

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your OTJ Dashboard</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px]">
        <TotalHours logs={logs} />
        <RecentLogs logs={logs} />
      </div>
      <HoursChart logs={logs} />
    </div>
  );
}

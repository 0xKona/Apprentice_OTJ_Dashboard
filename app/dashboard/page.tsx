"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTrainingLogsStore } from "@/lib/stores/training-logs-store";
import { HoursChart } from "@/components/dashboard/hours-chart";
import { TotalHours } from "@/components/dashboard/total-hours";
import { RecentLogs } from "@/components/dashboard/recent-logs";
import { AverageHours } from "@/components/dashboard/average-hours";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome to your OTJ Dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TotalHours logs={logs} />
        <RecentLogs logs={logs} />
        <AverageHours logs={logs} />
      </div>
      <HoursChart logs={logs} />
    </div>
  );
}

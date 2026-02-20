"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingLog } from "@/types/training-log";

interface RecentLogsProps {
  logs: TrainingLog[];
}

export function RecentLogs({ logs }: RecentLogsProps) {
  const { count, trend, trendPercent } = useMemo(() => {
    const now = new Date();
    const thisMonth = logs.filter((l) => {
      const d = new Date(l.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = logs.filter((l) => {
      const d = new Date(l.date);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    });
    const pct = lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 : 0;
    return { count: logs.length, trend: pct >= 0 ? "up" : "down", trendPercent: Math.abs(pct) };
  }, [logs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Log Entries</CardTitle>
        <span className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
          {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {trendPercent > 0 ? `${trend === "up" ? "+" : "-"}${trendPercent.toFixed(1)}%` : "—"}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{count.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {trend === "up" ? "More entries than last month" : "Fewer entries than last month"}
      </CardFooter>
    </Card>
  );
}

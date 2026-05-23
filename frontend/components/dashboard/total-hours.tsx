"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingLog } from "@/types/training-log";

interface TotalHoursProps {
  logs: TrainingLog[];
}

export function TotalHours({ logs }: TotalHoursProps) {
  const { totalHours, trend, trendPercent } = useMemo(() => {
    const total = logs.reduce((sum, log) => sum + log.durationHours, 0);

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

    const thisTotal = thisMonth.reduce((s, l) => s + l.durationHours, 0);
    const lastTotal = lastMonth.reduce((s, l) => s + l.durationHours, 0);
    const pct = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;

    return { totalHours: total, trend: pct >= 0 ? "up" : "down", trendPercent: Math.abs(pct) };
  }, [logs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total OTJ Hours</CardTitle>
        <span className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
          {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {trendPercent > 0 ? `${trend === "up" ? "+" : "-"}${trendPercent.toFixed(1)}%` : "—"}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{totalHours.toFixed(1)}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {trend === "up" ? "Trending up this month" : "Down this month"}
      </CardFooter>
    </Card>
  );
}

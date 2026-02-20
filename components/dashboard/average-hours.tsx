"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingLog } from "@/types/training-log";

interface AverageHoursProps {
  logs: TrainingLog[];
}

export function AverageHours({ logs }: AverageHoursProps) {
  const { avg, trend, trendPercent } = useMemo(() => {
    const monthMap = new Map<string, number>();
    logs.forEach((l) => {
      const d = new Date(l.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(key, (monthMap.get(key) || 0) + l.durationHours);
    });
    const months = Array.from(monthMap.values());
    const average = months.length > 0 ? months.reduce((a, b) => a + b, 0) / months.length : 0;

    const now = new Date();
    const thisKey = `${now.getFullYear()}-${now.getMonth()}`;
    const prevKey = `${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}-${now.getMonth() === 0 ? 11 : now.getMonth() - 1}`;
    const thisVal = monthMap.get(thisKey) || 0;
    const prevVal = monthMap.get(prevKey) || 0;
    const pct = prevVal > 0 ? ((thisVal - prevVal) / prevVal) * 100 : 0;

    return { avg: average, trend: pct >= 0 ? "up" : "down", trendPercent: Math.abs(pct) };
  }, [logs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Avg Hours / Month</CardTitle>
        <span className={`flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
          {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {trendPercent > 0 ? `${trend === "up" ? "+" : "-"}${trendPercent.toFixed(1)}%` : "—"}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{avg.toFixed(1)}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Monthly average across all periods
      </CardFooter>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TrainingLog } from "@/types/training-log";

interface HoursChartProps {
  logs: TrainingLog[];
}

const chartConfig = {
  hours: {
    label: "Hours",
    color: "var(--chart-1)",
  },
  entries: {
    label: "Entries",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function HoursChart({ logs }: HoursChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, { hours: number; entries: number }>();
    let earliestDate: Date | null = null;

    logs.forEach((log) => {
      const date = new Date(log.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyData.get(key) || { hours: 0, entries: 0 };
      monthlyData.set(key, {
        hours: existing.hours + log.durationHours,
        entries: existing.entries + 1,
      });
      if (!earliestDate || date < earliestDate) earliestDate = date;
    });

    const now = new Date();
    const start = earliestDate || new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const data = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    while (current <= end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      const label = current.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      const vals = monthlyData.get(key) || { hours: 0, entries: 0 };
      data.push({ month: label, hours: parseFloat(vals.hours.toFixed(1)), entries: vals.entries });
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>OTJ Hours Overview</CardTitle>
        <CardDescription>Hours and entries logged per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-hours)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-hours)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillEntries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-entries)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-entries)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="entries"
              type="natural"
              fill="url(#fillEntries)"
              stroke="var(--color-entries)"
              stackId="a"
            />
            <Area
              dataKey="hours"
              type="natural"
              fill="url(#fillHours)"
              stroke="var(--color-hours)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

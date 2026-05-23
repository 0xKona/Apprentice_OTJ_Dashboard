"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
} satisfies ChartConfig;

export function HoursChart({ logs }: HoursChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, number>();
    let earliestDate: Date | null = null;

    logs.forEach((log) => {
      const date = new Date(log.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData.set(key, (monthlyData.get(key) || 0) + log.durationHours);
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
      data.push({ month: label, hours: parseFloat((monthlyData.get(key) || 0).toFixed(1)) });
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>OTJ Hours Overview</CardTitle>
        <CardDescription>Hours logged per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

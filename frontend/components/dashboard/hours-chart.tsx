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
    let earliestDate: string | null = null;

    logs.forEach((log) => {
      const [year, month] = log.date.split("-");
      const key = `${year}-${month}`;
      monthlyData.set(key, (monthlyData.get(key) || 0) + log.durationHours);
      if (!earliestDate || log.date < earliestDate) earliestDate = log.date;
    });

    const now = new Date();
    const startKey = earliestDate || `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;
    const [startYear, startMonth] = startKey.split("-").map(Number);
    const data = [];
    let year = startYear;
    let month = startMonth;
    const endYear = now.getFullYear();
    const endMonth = now.getMonth() + 1;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const label = new Date(year, month - 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
      data.push({ month: label, hours: parseFloat((monthlyData.get(key) || 0).toFixed(1)) });
      month++;
      if (month > 12) { month = 1; year++; }
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

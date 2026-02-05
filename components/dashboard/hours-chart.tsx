"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingLog } from "@/types/training-log";

interface HoursChartProps {
  logs: TrainingLog[];
}

export function HoursChart({ logs }: HoursChartProps) {
  const chartData = useMemo(() => {
    const monthlyHours = new Map<string, number>();
    let earliestDate: Date | null = null;

    logs.forEach((log) => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyHours.set(
        monthKey,
        (monthlyHours.get(monthKey) || 0) + log.durationHours,
      );
      
      if (!earliestDate || date < earliestDate) {
        earliestDate = date;
      }
    });

    const now = new Date();
    const startDate = earliestDate || new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const data = [];
    
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    
    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = current.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
      });

      data.push({
        month: monthLabel,
        fullMonth: current.toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        }),
        hours: monthlyHours.get(monthKey) || 0,
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [logs]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <CardContent className="p-3">
            <p className="font-medium text-sm">{payload[0].payload.fullMonth}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Hours: {payload[0].value}
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hours Logged (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div style={{ minWidth: Math.max(chartData.length * 60, 800), height: 350 }}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  height={40}
                />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

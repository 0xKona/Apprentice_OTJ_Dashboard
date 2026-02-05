"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingLog } from "@/types/training-log";

interface TotalHoursProps {
  logs: TrainingLog[];
}

export function TotalHours({ logs }: TotalHoursProps) {
  const totalHours = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.durationHours, 0);
  }, [logs]);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Total Hours Logged</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{totalHours.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground mt-1">hours</p>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingLog } from "@/types/training-log";

interface RecentLogsProps {
  logs: TrainingLog[];
}

export function RecentLogs({ logs }: RecentLogsProps) {
  const recentLogs = useMemo(() => {
    return logs.slice(0, 50);
  }, [logs]);

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Recent Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-sm">
                  {new Date(log.date).toLocaleDateString("en-GB")}
                </p>
                <p className="text-sm text-muted-foreground">{log.durationHours}h</p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{log.activity}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

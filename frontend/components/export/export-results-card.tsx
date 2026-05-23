"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle2 } from "lucide-react";
import type { TrainingLog } from "@/types/training-log";

interface ExportResultsCardProps {
  logs: TrainingLog[];
  startDate: string;
  endDate: string;
  copied: boolean;
  onCopy: () => void;
}

export function ExportResultsCard({
  logs,
  startDate,
  endDate,
  copied,
  onCopy,
}: ExportResultsCardProps) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="size-5" />
              Export Results
            </CardTitle>
            <CardDescription>
              {logs.length} logs found between {startDate} and {endDate}
            </CardDescription>
          </div>
          <Button onClick={onCopy} variant="outline">
            {copied ? (
              <>
                <CheckCircle2 className="size-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Date</th>
                <th className="text-left p-2 font-medium">Start Time</th>
                <th className="text-left p-2 font-medium">End Time</th>
                <th className="text-left p-2 font-medium">Duration</th>
                <th className="text-left p-2 font-medium">Activity</th>
                <th className="text-left p-2 font-medium">New Learning</th>
                <th className="text-left p-2 font-medium">
                  Impact of Learning
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{log.date}</td>
                  <td className="p-2">{log.startTime}</td>
                  <td className="p-2">{log.endTime}</td>
                  <td className="p-2">{log.durationHours}h</td>
                  <td className="p-2">{log.activity}</td>
                  <td className="p-2 max-w-xs truncate">{log.newLearning}</td>
                  <td className="p-2 max-w-xs truncate">
                    {log.impactOfLearning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Tip: Click "Copy to Clipboard" and paste directly into Excel or Google
          Sheets
        </p>
      </CardContent>
    </Card>
  );
}

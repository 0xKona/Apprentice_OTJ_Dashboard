"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Copy, Calendar, CheckCircle2 } from "lucide-react";

Amplify.configure(outputs);

const client = generateClient<Schema>();

type TrainingLog = Schema["TrainingLog"]["type"];

export default function ExportLogsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isLoading2, setIsLoading2] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchLogs = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsLoading2(true);
    try {
      const { data } = await client.models.TrainingLog.list({
        authMode: "userPool",
      });

      if (data) {
        // Filter logs by date range
        const filtered = data.filter((log) => {
          const logDate = log.date;
          return logDate >= startDate && logDate <= endDate;
        });

        // Sort by date ascending
        filtered.sort((a, b) => a.date.localeCompare(b.date));
        setLogs(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      alert("Failed to fetch logs");
    } finally {
      setIsLoading2(false);
    }
  };

  const copyToClipboard = async () => {
    if (logs.length === 0) {
      alert("No logs to copy");
      return;
    }

    // Create tab-separated values (TSV) format for Excel compatibility
    const rows = logs.map((log) => [
      log.date,
      log.startTime,
      log.endTime,
      log.durationHours.toString(),
      log.activity,
      log.newLearning,
      log.impactOfLearning,
    ]);

    // Combine rows into TSV format
    const tsv = rows.map((row) => row.join("\t")).join("\n");

    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export Logs</h1>
        <p className="text-muted-foreground">
          Filter and export training logs for reporting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter by Date Range
          </CardTitle>
          <CardDescription>
            Select a date range to view and export logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                onClick={fetchLogs}
                disabled={isLoading2}
                className="w-full"
              >
                {isLoading2 ? "Loading..." : "Load Logs"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Results
                </CardTitle>
                <CardDescription>
                  {logs.length} logs found between {startDate} and {endDate}
                </CardDescription>
              </div>
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
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
                      <td className="p-2 max-w-xs truncate">
                        {log.newLearning}
                      </td>
                      <td className="p-2 max-w-xs truncate">
                        {log.impactOfLearning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Tip: Click "Copy to Clipboard" and paste directly into Excel or
              Google Sheets
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

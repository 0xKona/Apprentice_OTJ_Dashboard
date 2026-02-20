"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import type { TrainingLog } from "@/types/training-log";

const client = generateClient<Schema>();

interface UseExportLogsOptions {
  onError?: (message: string) => void;
}

export function useExportLogs({ onError }: UseExportLogsOptions = {}) {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchLogsByDateRange = async (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      onError?.("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
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
      onError?.("Failed to fetch logs");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (logs.length === 0) {
      onError?.("No logs to copy");
      return;
    }

    try {
      const { logsToTSV, copyToClipboard: copy } = await import("@/lib/export-utils");
      const tsv = logsToTSV(logs);
      await copy(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      onError?.("Failed to copy to clipboard");
    }
  };

  return {
    logs,
    isLoading,
    copied,
    fetchLogsByDateRange,
    copyToClipboard,
  };
}

"use client";

import { useState } from "react";
import { useExportLogs } from "@/hooks/use-export-logs";
import { DateRangeFilter } from "@/components/export/date-range-filter";
import { ExportResultsCard } from "@/components/export/export-results-card";

export default function ExportLogsPage() {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const { logs, isLoading, copied, fetchLogsByDateRange, copyToClipboard } =
    useExportLogs({
      onError: (message) => alert(message),
    });

  const handleFetch = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    fetchLogsByDateRange(startDate, endDate);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export Logs</h1>
        <p className="text-muted-foreground">
          Filter and export training logs for reporting
        </p>
      </div>

      <DateRangeFilter onFetch={handleFetch} isLoading={isLoading} />

      <ExportResultsCard
        logs={logs}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        copied={copied}
        onCopy={copyToClipboard}
      />
    </div>
  );
}

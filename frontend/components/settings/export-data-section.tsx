"use client";

import { useState, useEffect } from "react";
import { client } from "@/lib/api-client";
import { listTrainingLogs } from "@/lib/graphql/queries";
import type { TrainingLog } from "@/types/training-log";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Check } from "lucide-react";
import { logsToTSV, logsToCSV, copyToClipboard, downloadCSV } from "@/lib/export-utils";

export function ExportDataSection() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const fetchAllLogs = async () => {
    try {
      const response: any = await client.graphql({
        query: listTrainingLogs,
        variables: { limit: 1000 },
      });
      const data: TrainingLog[] = response.data.listTrainingLogs.items;
      setLogs(data.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const tsv = logsToTSV(logs);
      await copyToClipboard(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    try {
      const csv = logsToCSV(logs);
      downloadCSV(csv);
    } catch (err) {
      setError("Failed to download CSV");
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading logs...</div>;
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Before deleting your account, export your {logs.length} training log{logs.length !== 1 ? "s" : ""}.
        </AlertDescription>
      </Alert>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Button onClick={handleCopy} variant="outline" disabled={logs.length === 0}>
          {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
          {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>
        <Button onClick={handleDownload} variant="outline" disabled={logs.length === 0}>
          <Download className="size-4 mr-2" />
          Download CSV
        </Button>
      </div>
    </div>
  );
}

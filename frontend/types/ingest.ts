import type { TrainingLogData } from "@/lib/excel-parser";

export interface ParsedLog extends TrainingLogData {
  id: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
}

export interface FileWithLogs {
  fileName: string;
  status: "selected" | "parsed" | "error";
  parseError?: string;
  logs: ParsedLog[];
}

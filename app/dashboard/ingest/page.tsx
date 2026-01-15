"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { parseExcelFile, type TrainingLogData } from "@/lib/excel-parser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

Amplify.configure(outputs);

const client = generateClient<Schema>();

interface ParsedLog extends TrainingLogData {
  id: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
}

interface FileWithLogs {
  fileName: string;
  status: "selected" | "parsed" | "error";
  parseError?: string;
  logs: ParsedLog[];
}

export default function IngestLogsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [parsedFiles, setParsedFiles] = useState<FileWithLogs[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sheetName, setSheetName] = useState<string>("");
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "review" | "complete">("select");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".xlsm")
      );

      if (droppedFiles.length + files.length > 20) {
        alert("Maximum 20 files allowed");
        return;
      }

      setFiles((prev) => [...prev, ...droppedFiles]);
    },
    [files.length]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files).filter(
      (file) =>
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsm")
    );

    if (selectedFiles.length + files.length > 20) {
      alert("Maximum 20 files allowed");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const parseFiles = async () => {
    if (files.length === 0) return;

    setIsParsing(true);
    const parsed: FileWithLogs[] = [];

    for (const file of files) {
      try {
        const fileBuffer = await file.arrayBuffer();
        const parseResult = await parseExcelFile(fileBuffer, sheetName);

        if (!parseResult.success) {
          parsed.push({
            fileName: file.name,
            status: "error",
            parseError: parseResult.errors[0] || "Failed to parse file",
            logs: [],
          });
        } else {
          parsed.push({
            fileName: file.name,
            status: "parsed",
            logs: parseResult.processedLogs.map((log, idx) => ({
              ...log,
              id: `${file.name}-${idx}`,
              status: "pending",
            })),
          });
        }
      } catch (error) {
        parsed.push({
          fileName: file.name,
          status: "error",
          parseError: error instanceof Error ? error.message : "Unknown error",
          logs: [],
        });
      }
    }

    setParsedFiles(parsed);
    setStep("review");
    setIsParsing(false);
  };

  const deleteLog = (fileIndex: number, logId: string) => {
    setParsedFiles((prev) =>
      prev.map((file, idx) =>
        idx === fileIndex
          ? {
              ...file,
              logs: file.logs.filter((log) => log.id !== logId),
            }
          : file
      )
    );
  };

  const updateLog = (
    fileIndex: number,
    logId: string,
    updates: Partial<TrainingLogData>
  ) => {
    setParsedFiles((prev) =>
      prev.map((file, idx) =>
        idx === fileIndex
          ? {
              ...file,
              logs: file.logs.map((log) =>
                log.id === logId ? { ...log, ...updates } : log
              ),
            }
          : file
      )
    );
  };

  const uploadLogs = async () => {
    setIsUploading(true);

    for (let fileIdx = 0; fileIdx < parsedFiles.length; fileIdx++) {
      const file = parsedFiles[fileIdx];

      for (let logIdx = 0; logIdx < file.logs.length; logIdx++) {
        const log = file.logs[logIdx];
        if (log.status !== "pending") continue;

        // Update status to uploading
        setParsedFiles((prev) =>
          prev.map((f, fIdx) =>
            fIdx === fileIdx
              ? {
                  ...f,
                  logs: f.logs.map((l, lIdx) =>
                    lIdx === logIdx ? { ...l, status: "uploading" } : l
                  ),
                }
              : f
          )
        );

        try {
          await client.models.TrainingLog.create(
            {
              date: log.date,
              startTime: log.startTime,
              endTime: log.endTime,
              durationHours: log.durationHours,
              activity: log.activity,
              newLearning: log.newLearning,
              impactOfLearning: log.impactOfLearning,
              userId: "",
            },
            {
              authMode: "userPool",
            }
          );

          // Update status to uploaded
          setParsedFiles((prev) =>
            prev.map((f, fIdx) =>
              fIdx === fileIdx
                ? {
                    ...f,
                    logs: f.logs.map((l, lIdx) =>
                      lIdx === logIdx ? { ...l, status: "uploaded" } : l
                    ),
                  }
                : f
            )
          );
        } catch (error) {
          // Update status to error
          setParsedFiles((prev) =>
            prev.map((f, fIdx) =>
              fIdx === fileIdx
                ? {
                    ...f,
                    logs: f.logs.map((l, lIdx) =>
                      lIdx === logIdx
                        ? {
                            ...l,
                            status: "error",
                            error:
                              error instanceof Error
                                ? error.message
                                : "Unknown error",
                          }
                        : l
                    ),
                  }
                : f
            )
          );
        }
      }
    }

    setIsUploading(false);
    setStep("complete");
  };

  const reset = () => {
    setFiles([]);
    setParsedFiles([]);
    setStep("select");
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

  const totalLogs = parsedFiles.reduce(
    (sum, file) => sum + file.logs.length,
    0
  );
  const uploadedLogs = parsedFiles.reduce(
    (sum, file) =>
      sum + file.logs.filter((l) => l.status === "uploaded").length,
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ingest Existing Logs</h1>
        <p className="text-muted-foreground">
          Upload and import existing OTJ training logs from Excel files
        </p>
      </div>

      {/* Step 1: Select Files */}
      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 1: Select Excel Files
            </CardTitle>
            <CardDescription>
              Choose the Excel files containing your training logs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sheet-name" className="text-sm font-medium">
                Sheet Name (optional)
              </label>
              <Input
                id="sheet-name"
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Leave blank to use first sheet"
                disabled={isParsing}
              />
              <p className="text-xs text-muted-foreground">
                Specify which sheet to import from multi-sheet workbooks
              </p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Drop Excel files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .xlsx, .xls, and .xlsm files (max 20 files)
              </p>
              <input
                type="file"
                id="file-input"
                className="hidden"
                multiple
                accept=".xlsx,.xls,.xlsm"
                onChange={handleFileInput}
              />
              <Button
                onClick={() => document.getElementById("file-input")?.click()}
                variant="outline"
              >
                Browse Files
              </Button>
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Selected Files ({files.length}/20)
                  </h3>
                  <div className="flex gap-2">
                    <Button onClick={parseFiles} disabled={isParsing}>
                      {isParsing ? "Parsing..." : "Parse Files"}
                    </Button>
                    <Button
                      onClick={() => setFiles([])}
                      variant="outline"
                      disabled={isParsing}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Logs */}
      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Step 2: Review Parsed Logs
            </CardTitle>
            <CardDescription>
              Review, edit, or delete logs before uploading to the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total logs: {totalLogs}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={uploadLogs}
                  disabled={isUploading || totalLogs === 0}
                >
                  {isUploading ? "Uploading..." : `Upload ${totalLogs} Logs`}
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  disabled={isUploading}
                >
                  Start Over
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {parsedFiles.map((file, fileIdx) => (
                <div key={fileIdx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <h4 className="font-semibold">{file.fileName}</h4>
                    {file.status === "error" && (
                      <span className="text-xs text-red-600">
                        {file.parseError}
                      </span>
                    )}
                  </div>

                  {file.logs.length > 0 && (
                    <div className="space-y-2 ml-6">
                      {file.logs.map((log, logIdx) => (
                        <Card key={log.id}>
                          <CardContent className="p-4">
                            {editingLog === log.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium">
                                      Date
                                    </label>
                                    <Input
                                      type="date"
                                      value={log.date}
                                      onChange={(e) =>
                                        updateLog(fileIdx, log.id, {
                                          date: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium">
                                      Duration (hours)
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={log.durationHours}
                                      onChange={(e) =>
                                        updateLog(fileIdx, log.id, {
                                          durationHours: parseFloat(
                                            e.target.value
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium">
                                      Start Time
                                    </label>
                                    <Input
                                      type="time"
                                      value={log.startTime}
                                      onChange={(e) =>
                                        updateLog(fileIdx, log.id, {
                                          startTime: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium">
                                      End Time
                                    </label>
                                    <Input
                                      type="time"
                                      value={log.endTime}
                                      onChange={(e) =>
                                        updateLog(fileIdx, log.id, {
                                          endTime: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs font-medium">
                                    Activity
                                  </label>
                                  <Input
                                    value={log.activity}
                                    onChange={(e) =>
                                      updateLog(fileIdx, log.id, {
                                        activity: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">
                                    New Learning
                                  </label>
                                  <textarea
                                    className="w-full px-3 py-2 border rounded-md min-h-15"
                                    value={log.newLearning}
                                    onChange={(e) =>
                                      updateLog(fileIdx, log.id, {
                                        newLearning: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">
                                    Impact of Learning
                                  </label>
                                  <textarea
                                    className="w-full px-3 py-2 border rounded-md min-h-15"
                                    value={log.impactOfLearning}
                                    onChange={(e) =>
                                      updateLog(fileIdx, log.id, {
                                        impactOfLearning: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <Button
                                  onClick={() => setEditingLog(null)}
                                  size="sm"
                                >
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {log.date}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {log.startTime} - {log.endTime} (
                                      {log.durationHours}h)
                                    </span>
                                    {log.status === "uploading" && (
                                      <span className="text-xs text-blue-600">
                                        Uploading...
                                      </span>
                                    )}
                                    {log.status === "uploaded" && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                    {log.status === "error" && (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                  <p className="text-sm">{log.activity}</p>
                                  {log.error && (
                                    <p className="text-xs text-red-600">
                                      {log.error}
                                    </p>
                                  )}
                                </div>
                                {log.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingLog(log.id)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteLog(fileIdx, log.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Upload Complete
            </CardTitle>
            <CardDescription>
              Your training logs have been uploaded to the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Successfully uploaded {uploadedLogs} of {totalLogs} logs.
            </p>
            <div className="flex gap-2">
              <Button onClick={reset}>Upload More Files</Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/logs")}
              >
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

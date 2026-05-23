"use client";

import { useState } from "react";
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
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import type { FileWithLogs } from "@/types/ingest";
import type { TrainingLogData } from "@/lib/excel-parser";

interface LogReviewStepProps {
  parsedFiles: FileWithLogs[];
  totalLogs: number;
  isUploading: boolean;
  onUpdateLog: (
    fileIndex: number,
    logId: string,
    updates: Partial<TrainingLogData>
  ) => void;
  onDeleteLog: (fileIndex: number, logId: string) => void;
  onUploadLogs: () => void;
  onReset: () => void;
}

export function LogReviewStep({
  parsedFiles,
  totalLogs,
  isUploading,
  onUpdateLog,
  onDeleteLog,
  onUploadLogs,
  onReset,
}: LogReviewStepProps) {
  const [editingLog, setEditingLog] = useState<string | null>(null);

  return (
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
              onClick={onUploadLogs}
              disabled={isUploading || totalLogs === 0}
            >
              {isUploading ? "Uploading..." : `Upload ${totalLogs} Logs`}
            </Button>
            <Button onClick={onReset} variant="outline" disabled={isUploading}>
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
                  {file.logs.map((log) => (
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
                                    onUpdateLog(fileIdx, log.id, {
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
                                    onUpdateLog(fileIdx, log.id, {
                                      durationHours: parseFloat(e.target.value),
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
                                    onUpdateLog(fileIdx, log.id, {
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
                                    onUpdateLog(fileIdx, log.id, {
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
                                  onUpdateLog(fileIdx, log.id, {
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
                                  onUpdateLog(fileIdx, log.id, {
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
                                  onUpdateLog(fileIdx, log.id, {
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
                                <span className="font-medium">{log.date}</span>
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
                                  onClick={() => onDeleteLog(fileIdx, log.id)}
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
  );
}

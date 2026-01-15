"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { parseExcelFile, type TrainingLogData } from "@/lib/excel-parser";
import type { FileWithLogs, ParsedLog } from "@/types/ingest";

const client = generateClient<Schema>();

interface UseIngestLogsOptions {
  onError?: (message: string) => void;
}

export function useIngestLogs({ onError }: UseIngestLogsOptions = {}) {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedFiles, setParsedFiles] = useState<FileWithLogs[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = (newFiles: File[]) => {
    if (newFiles.length + files.length > 20) {
      onError?.("Maximum 20 files allowed");
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const parseFiles = async (sheetName?: string) => {
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
    setIsParsing(false);
    return parsed.length > 0;
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
  };

  const reset = () => {
    setFiles([]);
    setParsedFiles([]);
  };

  const totalLogs = parsedFiles.reduce(
    (sum, file) => sum + file.logs.length,
    0
  );
  const uploadedLogs = parsedFiles.reduce(
    (sum, file) =>
      sum + file.logs.filter((l) => l.status === "uploaded").length,
    0
  );

  return {
    files,
    parsedFiles,
    isParsing,
    isUploading,
    totalLogs,
    uploadedLogs,
    addFiles,
    clearFiles,
    parseFiles,
    deleteLog,
    updateLog,
    uploadLogs,
    reset,
  };
}

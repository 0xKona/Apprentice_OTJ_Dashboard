"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIngestLogs } from "@/hooks/use-ingest-logs";
import { FileSelectionStep } from "@/components/ingest/file-selection-step";
import { LogReviewStep } from "@/components/ingest/log-review-step";
import { UploadCompleteStep } from "@/components/ingest/upload-complete-step";

export default function IngestLogsPage() {
  const router = useRouter();
  const [sheetName, setSheetName] = useState("");
  const [step, setStep] = useState<"select" | "review" | "complete">("select");

  const {
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
  } = useIngestLogs({
    onError: (message) => alert(message),
  });

  const handleParseFiles = async () => {
    const success = await parseFiles(sheetName);
    if (success) {
      setStep("review");
    }
  };

  const handleUploadLogs = async () => {
    await uploadLogs();
    setStep("complete");
  };

  const handleReset = () => {
    reset();
    setSheetName("");
    setStep("select");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ingest Existing Logs</h1>
        <p className="text-muted-foreground">
          Upload and import existing OTJ training logs from Excel files
        </p>
      </div>

      {step === "select" && (
        <FileSelectionStep
          files={files}
          sheetName={sheetName}
          isParsing={isParsing}
          onSheetNameChange={setSheetName}
          onAddFiles={addFiles}
          onClearFiles={clearFiles}
          onParseFiles={handleParseFiles}
        />
      )}

      {step === "review" && (
        <LogReviewStep
          parsedFiles={parsedFiles}
          totalLogs={totalLogs}
          isUploading={isUploading}
          onUpdateLog={updateLog}
          onDeleteLog={deleteLog}
          onUploadLogs={handleUploadLogs}
          onReset={handleReset}
        />
      )}

      {step === "complete" && (
        <UploadCompleteStep
          uploadedLogs={uploadedLogs}
          totalLogs={totalLogs}
          onReset={handleReset}
          onViewLogs={() => router.push("/dashboard/logs")}
        />
      )}
    </div>
  );
}

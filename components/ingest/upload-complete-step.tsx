"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface UploadCompleteStepProps {
  uploadedLogs: number;
  totalLogs: number;
  onReset: () => void;
  onViewLogs: () => void;
}

export function UploadCompleteStep({
  uploadedLogs,
  totalLogs,
  onReset,
  onViewLogs,
}: UploadCompleteStepProps) {
  return (
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
          <Button onClick={onReset}>Upload More Files</Button>
          <Button variant="outline" onClick={onViewLogs}>
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

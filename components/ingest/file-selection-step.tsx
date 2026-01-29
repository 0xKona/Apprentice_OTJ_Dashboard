"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileSelectionStepProps {
  files: File[];
  sheetName: string;
  isParsing: boolean;
  onSheetNameChange: (name: string) => void;
  onAddFiles: (files: File[]) => void;
  onClearFiles: () => void;
  onParseFiles: () => void;
}

export function FileSelectionStep({
  files,
  sheetName,
  isParsing,
  onSheetNameChange,
  onAddFiles,
  onClearFiles,
  onParseFiles,
}: FileSelectionStepProps) {
  const [isDragging, setIsDragging] = useState(false);

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

      onAddFiles(droppedFiles);
    },
    [onAddFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files).filter(
      (file) =>
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsm")
    );

    onAddFiles(selectedFiles);
  };

  return (
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
            onChange={(e) => onSheetNameChange(e.target.value)}
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
                <Button onClick={onParseFiles} disabled={isParsing}>
                  {isParsing ? "Parsing..." : "Parse Files"}
                </Button>
                <Button
                  onClick={onClearFiles}
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
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AiComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldLabel: string;
  originalText: string;
  suggestedText: string;
  onAccept: (finalText: string) => void;
  onReject: () => void;
}

export function AiComparisonDialog({
  open,
  onOpenChange,
  fieldLabel,
  originalText,
  suggestedText,
  onAccept,
  onReject,
}: AiComparisonDialogProps) {
  const [editedText, setEditedText] = useState(suggestedText);

  // Reset edited text when suggestion changes
  useEffect(() => {
    setEditedText(suggestedText);
  }, [suggestedText]);

  const handleAccept = () => {
    onAccept(editedText);
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Suggestion for {fieldLabel}</DialogTitle>
          <DialogDescription>
            Review the AI-improved text. You can edit it before accepting.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Original Text */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Original</Label>
            <div className="rounded-md border bg-muted/50 p-3 min-h-[150px] max-h-[400px] overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">
                {originalText || "(empty)"}
              </p>
            </div>
          </div>

          {/* AI Suggested Text (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="aiSuggestion">AI Suggestion (Editable)</Label>
            <Textarea
              id="aiSuggestion"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[150px] max-h-[400px]"
              rows={8}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleAccept}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

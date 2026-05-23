"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CURRENT_VERSION = "1.0.0";
const STORAGE_KEY = "whats-new-version";

export function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem(STORAGE_KEY);
    if (seenVersion !== CURRENT_VERSION) {
      setOpen(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What's New in v{CURRENT_VERSION}</DialogTitle>
          <DialogDescription>
            Check out the latest updates and improvements
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-1">
              Beta Notice
            </p>
            <p className="text-sm text-muted-foreground">
              This app is currently in beta and only supports OTJ logs in the specific format used by this application. Custom log templates will be available in a future update.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">New Features</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Track your apprenticeship hours</li>
              <li>Document learning experiences</li>
              <li>Visualize progress with charts</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAcknowledge}>Got it!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

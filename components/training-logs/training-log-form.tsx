"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Plus } from "lucide-react";

const client = generateClient<Schema>();

interface TrainingLogFormProps {
  onSuccess?: () => void;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    activity: string;
    newLearning: string;
    impactOfLearning: string;
  };
}

export function TrainingLogForm({
  onSuccess,
  mode = "create",
  initialData,
}: TrainingLogFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: initialData?.date || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    activity: initialData?.activity || "",
    newLearning: initialData?.newLearning || "",
    impactOfLearning: initialData?.impactOfLearning || "",
  });

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return durationMinutes / 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const durationHours = calculateDuration(
        formData.startTime,
        formData.endTime
      );

      if (durationHours <= 0) {
        setError("End time must be after start time");
        setLoading(false);
        return;
      }

      if (mode === "create") {
        await client.models.TrainingLog.create({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          durationHours,
          activity: formData.activity,
          newLearning: formData.newLearning,
          impactOfLearning: formData.impactOfLearning,
          userId: "", // This will be automatically set by Amplify using the authenticated user's ID
        });
      } else if (initialData?.id) {
        await client.models.TrainingLog.update({
          id: initialData.id,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          durationHours,
          activity: formData.activity,
          newLearning: formData.newLearning,
          impactOfLearning: formData.impactOfLearning,
        });
      }

      setOpen(false);
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        activity: "",
        newLearning: "",
        impactOfLearning: "",
      });
      onSuccess?.();
    } catch (err) {
      console.error("Error saving training log:", err);
      setError("Failed to save training log. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Training Log
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add Training Log" : "Edit Training Log"}
            </DialogTitle>
            <DialogDescription>
              Record your off-the-job training activity. All fields are
              required.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200 mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activity">Activity</Label>
              <Textarea
                id="activity"
                placeholder="Describe what you did during this training period..."
                value={formData.activity}
                onChange={(e) =>
                  setFormData({ ...formData, activity: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newLearning">New Learning</Label>
              <Textarea
                id="newLearning"
                placeholder="What did you learn that you didn't know before?"
                value={formData.newLearning}
                onChange={(e) =>
                  setFormData({ ...formData, newLearning: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="impactOfLearning">Impact of Learning</Label>
              <Textarea
                id="impactOfLearning"
                placeholder="How will this learning impact your work or development?"
                value={formData.impactOfLearning}
                onChange={(e) =>
                  setFormData({ ...formData, impactOfLearning: e.target.value })
                }
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Add Log"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

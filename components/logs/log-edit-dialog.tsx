"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TrainingLog } from "@/types/training-log";

const logSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  activity: z.string().min(1, "Activity is required"),
  newLearning: z.string().min(1, "New learning is required"),
  impactOfLearning: z.string().min(1, "Impact of learning is required"),
});

type LogFormData = z.infer<typeof logSchema>;

interface LogEditDialogProps {
  log: TrainingLog | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<TrainingLog>) => Promise<void>;
}

export function LogEditDialog({
  log,
  open,
  onClose,
  onSave,
}: LogEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      activity: "",
      newLearning: "",
      impactOfLearning: "",
    },
  });

  // Reset form with log data when dialog opens or log changes
  useEffect(() => {
    if (log && open) {
      reset({
        date: log.date,
        startTime: log.startTime,
        endTime: log.endTime,
        activity: log.activity,
        newLearning: log.newLearning,
        impactOfLearning: log.impactOfLearning,
      });
    }
  }, [log, open, reset]);

  const onSubmit = async (data: LogFormData) => {
    if (!log) return;

    setIsSubmitting(true);
    try {
      await onSave(log.id, data);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to save log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Training Log</DialogTitle>
          <DialogDescription>
            Make changes to your training log entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input
                    id="date"
                    type="date"
                    {...field}
                    className={errors.date ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="startTime"
                    type="time"
                    {...field}
                    className={errors.startTime ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="endTime"
                    type="time"
                    {...field}
                    className={errors.endTime ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Controller
              name="activity"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="activity"
                  {...field}
                  className={errors.activity ? "border-red-500" : ""}
                  rows={3}
                />
              )}
            />
            {errors.activity && (
              <p className="text-sm text-red-500">{errors.activity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newLearning">New Learning</Label>
            <Controller
              name="newLearning"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="newLearning"
                  {...field}
                  className={errors.newLearning ? "border-red-500" : ""}
                  rows={3}
                />
              )}
            />
            {errors.newLearning && (
              <p className="text-sm text-red-500">
                {errors.newLearning.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="impactOfLearning">Impact of Learning</Label>
            <Controller
              name="impactOfLearning"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="impactOfLearning"
                  {...field}
                  className={errors.impactOfLearning ? "border-red-500" : ""}
                  rows={3}
                />
              )}
            />
            {errors.impactOfLearning && (
              <p className="text-sm text-red-500">
                {errors.impactOfLearning.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    values: log
      ? {
          date: log.date,
          startTime: log.startTime,
          endTime: log.endTime,
          activity: log.activity,
          newLearning: log.newLearning,
          impactOfLearning: log.impactOfLearning,
        }
      : undefined,
  });

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
              <Input
                id="date"
                type="date"
                {...register("date")}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                className={errors.startTime ? "border-red-500" : ""}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                className={errors.endTime ? "border-red-500" : ""}
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Textarea
              id="activity"
              {...register("activity")}
              className={errors.activity ? "border-red-500" : ""}
              rows={3}
            />
            {errors.activity && (
              <p className="text-sm text-red-500">{errors.activity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newLearning">New Learning</Label>
            <Textarea
              id="newLearning"
              {...register("newLearning")}
              className={errors.newLearning ? "border-red-500" : ""}
              rows={3}
            />
            {errors.newLearning && (
              <p className="text-sm text-red-500">
                {errors.newLearning.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="impactOfLearning">Impact of Learning</Label>
            <Textarea
              id="impactOfLearning"
              {...register("impactOfLearning")}
              className={errors.impactOfLearning ? "border-red-500" : ""}
              rows={3}
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

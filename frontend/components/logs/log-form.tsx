"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AiSuggestionButton } from "@/components/ai/ai-suggestion-button";
import { AiComparisonDialog } from "@/components/ai/ai-comparison-dialog";
import { client } from "@/lib/api-client";
import {
  createTrainingLog,
  updateTrainingLog,
  generateImprovement,
} from "@/lib/graphql/mutations";
import type { TrainingLog } from "@/types/training-log";
import { useAiRateLimit } from "@/hooks/use-ai-rate-limit";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

const logSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  activity: z.string().min(1, "Activity is required"),
  newLearning: z.string().min(1, "New learning is required"),
  impactOfLearning: z.string().min(1, "Impact of learning is required"),
});

type LogFormData = z.infer<typeof logSchema>;

interface TrainingLogFormProps {
  log?: TrainingLog | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function TrainingLogForm({
  log,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  trigger,
}: TrainingLogFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [currentField, setCurrentField] = useState<keyof LogFormData | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [suggestedText, setSuggestedText] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const {
    canUseAi,
    remainingUses,
    dailyLimit,
    isLoading: rateLimitLoading,
    error: aiRateLimitError,
    setLimitReached,
    refresh: refreshRateLimit,
  } = useAiRateLimit();

  useEffect(() => {
    if (aiRateLimitError) {
      toast.error("AI rate limit error: " + aiRateLimitError);
    }
  }, [aiRateLimitError]);

  const form = useForm<LogFormData>({
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

  const formValues = form.watch();

  useEffect(() => {
    if (log && open) {
      form.reset({
        date: log.date,
        startTime: log.startTime,
        endTime: log.endTime,
        activity: log.activity,
        newLearning: log.newLearning,
        impactOfLearning: log.impactOfLearning,
      });
    } else if (!log && open) {
      form.reset({
        date: "",
        startTime: "",
        endTime: "",
        activity: "",
        newLearning: "",
        impactOfLearning: "",
      });
    }
  }, [log, open, form]);

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    return (endHours * 60 + endMinutes - (startHours * 60 + startMinutes)) / 60;
  };

  const handleAiImprove = async (fieldName: keyof LogFormData) => {
    const currentText = formValues[fieldName];

    if (!canUseAi) {
      toast.error(`Daily AI limit reached (${dailyLimit} uses). Resets tomorrow.`);
      return;
    }

    if (!formValues.activity || formValues.activity.trim().length === 0) {
      toast.error("Please fill in the Activity field first to provide context.");
      return;
    }

    setOriginalText(currentText);
    setCurrentField(fieldName);
    setIsGenerating(true);

    try {
      const response: any = await client.graphql({
        query: generateImprovement,
        variables: {
          currentFieldContent: currentText || "No content provided",
          fieldName,
          fullLogContext: JSON.stringify(formValues),
        },
      });

      const improvedText = (response.data.generateImprovement || "").trim();

      if (!improvedText || improvedText.length < 10) {
        toast.error("AI generated invalid response. Please try again.");
        setCurrentField(null);
        return;
      }

      setSuggestedText(improvedText);
      setComparisonDialogOpen(true);
      refreshRateLimit();
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || error?.message || "";
      if (message.includes("Daily AI usage limit reached")) {
        setLimitReached();
        toast.error(`Daily AI limit reached (${dailyLimit} uses). Resets tomorrow.`);
      } else {
        toast.error("Failed to generate improvement. Please try again.");
      }
      setCurrentField(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = (finalText: string) => {
    if (currentField) {
      form.setValue(currentField, finalText);
    }
  };

  const fieldLabels: Record<keyof LogFormData, string> = {
    date: "Date",
    startTime: "Start Time",
    endTime: "End Time",
    activity: "Activity",
    newLearning: "New Learning",
    impactOfLearning: "Impact of Learning",
  };

  const onSubmit = async (data: LogFormData) => {
    setIsSubmitting(true);

    try {
      const durationHours = calculateDuration(data.startTime, data.endTime);

      if (durationHours <= 0) {
        console.error("End time must be after start time");
        setIsSubmitting(false);
        return;
      }

      if (log?.id) {
        await client.graphql({
          query: updateTrainingLog,
          variables: { input: { id: log.id, ...data, durationHours } },
        });
      } else {
        await client.graphql({
          query: createTrainingLog,
          variables: { input: { ...data, durationHours } },
        });
      }

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const setToday = () => {
    form.setValue("date", new Date().toISOString().split("T")[0]);
  };

  const defaultTrigger = (
    <Button variant="secondary">
      <Plus className="mr-2 size-4" />
      Add Training Log
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {log ? "Edit Training Log" : "Add Training Log"}
          </DialogTitle>
          <DialogDescription>
            {log
              ? "Make changes to your training log entry."
              : "Record your off-the-job training activity. All fields are required."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Date</FormLabel>
                    {!log && (
                      <Button type="button" variant="outline" size="sm" onClick={setToday}>
                        <Calendar className="mr-2 size-3" />
                        Today
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you did during this training period..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newLearning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Learning</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you learn that you didn't know before?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impactOfLearning"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Impact of Learning</FormLabel>
                    <div className="flex items-center gap-2">
                      {!rateLimitLoading && (
                        <span className="text-xs text-muted-foreground">
                          {remainingUses}/{dailyLimit} AI uses left today
                        </span>
                      )}
                      <AiSuggestionButton
                        onClick={() => handleAiImprove("impactOfLearning")}
                        isLoading={isGenerating}
                        disabled={
                          !canUseAi ||
                          rateLimitLoading ||
                          (!formValues.activity && !formValues.newLearning)
                        }
                      />
                    </div>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="How will this learning impact your work or development?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Saving..." : log ? "Save changes" : "Add Log"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <AiComparisonDialog
        open={comparisonDialogOpen}
        onOpenChange={setComparisonDialogOpen}
        fieldLabel={currentField ? fieldLabels[currentField] : ""}
        originalText={originalText}
        suggestedText={suggestedText}
        onAccept={handleAcceptSuggestion}
        onReject={() => {}}
      />
    </Dialog>
  );
}

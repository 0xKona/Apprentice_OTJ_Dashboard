import type { TrainingLog } from "@/types/training-log";

export function logsToTSV(logs: TrainingLog[]): string {
  const rows = logs.map((log) => [
    log.date,
    log.startTime,
    log.endTime,
    log.durationHours.toString(),
    log.activity,
    log.newLearning,
    log.impactOfLearning,
  ]);
  return rows.map((row) => row.join("\t")).join("\n");
}

export function logsToCSV(logs: TrainingLog[]): string {
  const headers = [
    "Date",
    "Start Time",
    "End Time",
    "Duration (Hours)",
    "Activity",
    "New Learning",
    "Impact of Learning",
  ];
  
  const rows = logs.map((log) => [
    log.date,
    log.startTime,
    log.endTime,
    log.durationHours.toString(),
    `"${log.activity.replace(/"/g, '""')}"`,
    `"${log.newLearning.replace(/"/g, '""')}"`,
    `"${log.impactOfLearning.replace(/"/g, '""')}"`,
  ]);
  
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function downloadCSV(csv: string, filename: string = "training-logs.csv"): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

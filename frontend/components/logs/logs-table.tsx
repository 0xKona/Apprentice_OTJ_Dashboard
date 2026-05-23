"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { TrainingLog } from "@/types/training-log";

interface LogsTableProps {
  logs: TrainingLog[];
  onEdit: (log: TrainingLog) => void;
  onDelete: (id: string, date: string) => void;
  isLoading?: boolean;
}

export function LogsTable({
  logs,
  onEdit,
  onDelete,
  isLoading,
}: LogsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Loading logs...
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No logs found matching your filters.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>New Learning</TableHead>
            <TableHead>Impact of Learning</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.date}</TableCell>
              <TableCell>{log.startTime}</TableCell>
              <TableCell>{log.endTime}</TableCell>
              <TableCell className="max-w-50 truncate">
                {log.activity}
              </TableCell>
              <TableCell className="max-w-50 truncate">
                {log.newLearning}
              </TableCell>
              <TableCell className="max-w-50 truncate">
                {log.impactOfLearning}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(log)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(log.id, log.date)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

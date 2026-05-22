"use client";

import { useEffect, useState } from "react";
import { useTrainingLogsStore } from "@/lib/stores/training-logs-store";
import { useLogsFilter } from "@/hooks/use-logs-filter";
import { TrainingLogForm } from "@/components/logs/log-form";
import { LogsTable } from "@/components/logs/logs-table";
import { LogsFilters } from "@/components/logs/logs-filters";
import { LogsPagination } from "@/components/logs/logs-pagination";
import type { TrainingLog } from "@/types/training-log";

export default function LogsPage() {
  const { logs, isLoading, fetchLogs, deleteLog } = useTrainingLogsStore();
  const [selectedLog, setSelectedLog] = useState<TrainingLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    searchText,
    startDate,
    endDate,
    currentPage,
    paginatedLogs,
    totalPages,
    totalFilteredLogs,
    setSearchText,
    setStartDate,
    setEndDate,
    goToNextPage,
    goToPreviousPage,
    clearFilters,
  } = useLogsFilter({ logs });

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleEdit = (log: TrainingLog) => {
    setSelectedLog(log);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string, date: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteLog(id, date);
    }
  };

  const handleLogSaved = () => {
    fetchLogs();
    setIsEditDialogOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your off-the-job training activities
          </p>
        </div>
        <TrainingLogForm onSuccess={handleLogSaved} />
      </div>

      <LogsFilters
        searchText={searchText}
        startDate={startDate}
        endDate={endDate}
        onSearchChange={setSearchText}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
        totalLogs={logs.length}
        filteredCount={totalFilteredLogs}
      />

      <LogsTable
        logs={paginatedLogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <LogsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
      />

      <TrainingLogForm
        log={selectedLog}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleLogSaved}
      />
    </div>
  );
}

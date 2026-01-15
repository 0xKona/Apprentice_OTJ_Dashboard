"use client";

import { useEffect, useState } from "react";
import { useTrainingLogsStore } from "@/lib/stores/training-logs-store";
import { useLogsFilter } from "@/hooks/use-logs-filter";
import { TrainingLogForm } from "@/components/training-logs/training-log-form";
import { LogsTable } from "@/components/logs/logs-table";
import { LogsFilters } from "@/components/logs/logs-filters";
import { LogsPagination } from "@/components/logs/logs-pagination";
import { LogEditDialog } from "@/components/logs/log-edit-dialog";
import type { Schema } from "@/amplify/data/resource";

type TrainingLog = Schema["TrainingLog"]["type"];

export default function LogsPage() {
  const { logs, isLoading, fetchLogs, updateLog, deleteLog } =
    useTrainingLogsStore();
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

  const handleSave = async (id: string, data: Partial<TrainingLog>) => {
    await updateLog(id, data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteLog(id);
    }
  };

  const handleLogCreated = () => {
    fetchLogs();
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
        <TrainingLogForm onSuccess={handleLogCreated} />
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

      <LogEditDialog
        log={selectedLog}
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import type { TrainingLog } from "@/types/training-log";

interface UseLogsFilterOptions {
  logs: TrainingLog[];
}

export function useLogsFilter({ logs }: UseLogsFilterOptions) {
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.activity.toLowerCase().includes(searchLower) ||
          log.newLearning.toLowerCase().includes(searchLower) ||
          log.impactOfLearning.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((log) => log.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((log) => log.date <= endDate);
    }

    return filtered;
  }, [logs, searchText, startDate, endDate]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, logsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return {
    // State
    searchText,
    startDate,
    endDate,
    currentPage,
    
    // Computed
    filteredLogs,
    paginatedLogs,
    totalPages,
    totalFilteredLogs: filteredLogs.length,
    
    // Actions
    setSearchText,
    setStartDate,
    setEndDate,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    clearFilters,
  };
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { TrainingLogForm } from "@/components/training-logs/training-log-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Search, X } from "lucide-react";

const client = generateClient<Schema>();

type TrainingLog = Schema["TrainingLog"]["type"];

export default function LogsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [allLogs, setAllLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const logsPerPage = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchLogs = async (token?: string | null) => {
    setLoading(true);
    try {
      // Fetch all logs for client-side filtering
      const allData: TrainingLog[] = [];
      let currentToken = token || undefined;

      // Fetch all pages
      do {
        const response = await client.models.TrainingLog.list({
          limit: 1000,
          nextToken: currentToken,
        });
        allData.push(...response.data);
        currentToken = response.nextToken || undefined;
      } while (currentToken);

      setAllLogs(allData);
      applyFilters(allData, searchText, startDate, endDate);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    data: TrainingLog[],
    search: string,
    start: string,
    end: string
  ) => {
    let filtered = [...data];

    // Text search across activity, newLearning, and impactOfLearning
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.activity.toLowerCase().includes(searchLower) ||
          log.newLearning.toLowerCase().includes(searchLower) ||
          log.impactOfLearning.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (start) {
      filtered = filtered.filter((log) => log.date >= start);
    }
    if (end) {
      filtered = filtered.filter((log) => log.date <= end);
    }

    // Sort by date descending
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setLogs(filtered);
    setCurrentPage(1);
    setPreviousTokens([]);
    setNextToken(null);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      await client.models.TrainingLog.delete({ id });
      await fetchLogs();
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const handleSearch = () => {
    applyFilters(allLogs, searchText, startDate, endDate);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStartDate("");
    setEndDate("");
    applyFilters(allLogs, "", "", "");
  };

  const handleNextPage = () => {
    if (currentPage * logsPerPage < logs.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedLogs = logs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const totalPages = Math.ceil(logs.length / logsPerPage);
  const hasNextPage = currentPage < totalPages;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your off-the-job training activities
          </p>
        </div>
        <TrainingLogForm onSuccess={() => fetchLogs()} />
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Search & Filter</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="searchText">Search Text</Label>
            <Input
              id="searchText"
              placeholder="Search activity, learning, or impact..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} size="sm">
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>New Learning</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {logs.length === 0 && !searchText && !startDate && !endDate
                    ? "No training logs yet. Click 'Add Training Log' to get started."
                    : "No logs found matching your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {formatDate(log.date)}
                  </TableCell>
                  <TableCell>
                    {log.startTime} - {log.endTime}
                  </TableCell>
                  <TableCell>{log.durationHours.toFixed(2)}h</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.activity}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.newLearning}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.impactOfLearning}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <TrainingLogForm
                      mode="edit"
                      initialData={{
                        id: log.id,
                        date: log.date,
                        startTime: log.startTime,
                        endTime: log.endTime,
                        activity: log.activity,
                        newLearning: log.newLearning,
                        impactOfLearning: log.impactOfLearning,
                      }}
                      onSuccess={() => fetchLogs()}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Training Log
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this training log?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(log.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && logs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * logsPerPage + 1} to{" "}
            {Math.min(currentPage * logsPerPage, logs.length)} of {logs.length}{" "}
            logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

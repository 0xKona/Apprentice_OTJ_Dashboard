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
import { Trash2 } from "lucide-react";

const client = generateClient<Schema>();

type TrainingLog = Schema["TrainingLog"]["type"];

export default function LogsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const logsPerPage = 10;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchLogs = async (token?: string | null) => {
    setLoading(true);
    try {
      const response = await client.models.TrainingLog.list({
        limit: logsPerPage,
        nextToken: token || undefined,
      });
      setLogs(response.data);
      setNextToken(response.nextToken || null);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      await client.models.TrainingLog.delete({ id });
      await fetchLogs(
        currentPage === 1 ? undefined : previousTokens[currentPage - 2]
      );
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const handleNextPage = () => {
    if (nextToken) {
      setPreviousTokens([...previousTokens, nextToken]);
      setCurrentPage(currentPage + 1);
      fetchLogs(nextToken);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const token = newPage === 1 ? undefined : previousTokens[newPage - 2];
      setPreviousTokens(previousTokens.slice(0, -1));
      fetchLogs(token);
    }
  };

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
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No training logs yet. Click "Add Training Log" to get started.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
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
                      onSuccess={() =>
                        fetchLogs(
                          currentPage === 1
                            ? undefined
                            : previousTokens[currentPage - 2]
                        )
                      }
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
          <p className="text-sm text-muted-foreground">Page {currentPage}</p>
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
              disabled={!nextToken}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

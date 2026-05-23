import { create } from "zustand";
import { client } from "@/lib/api-client";
import { listTrainingLogs } from "@/lib/graphql/queries";
import {
  createTrainingLog,
  updateTrainingLog,
  deleteTrainingLog,
} from "@/lib/graphql/mutations";
import type { TrainingLog } from "@/types/training-log";

interface TrainingLogsState {
  logs: TrainingLog[];
  isLoading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  createLog: (log: Omit<TrainingLog, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  updateLog: (id: string, updates: Partial<TrainingLog>) => Promise<void>;
  deleteLog: (id: string, date: string) => Promise<void>;
  clearError: () => void;
}

export const useTrainingLogsStore = create<TrainingLogsState>((set) => ({
  logs: [],
  isLoading: false,
  error: null,

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const allData: TrainingLog[] = [];
      let nextToken: string | null = null;

      do {
        const response: any = await client.graphql({
          query: listTrainingLogs,
          variables: { limit: 1000, nextToken },
        });
        allData.push(...response.data.listTrainingLogs.items);
        nextToken = response.data.listTrainingLogs.nextToken;
      } while (nextToken);

      allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      set({ logs: allData, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch logs",
        isLoading: false,
      });
    }
  },

  createLog: async (log) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await client.graphql({
        query: createTrainingLog,
        variables: { input: log },
      });

      if (response.data.createTrainingLog) {
        set((state) => ({
          logs: [response.data.createTrainingLog, ...state.logs],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create log",
        isLoading: false,
      });
      throw error;
    }
  },

  updateLog: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await client.graphql({
        query: updateTrainingLog,
        variables: { input: { id, ...updates } },
      });

      if (response.data.updateTrainingLog) {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? response.data.updateTrainingLog : log
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update log",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteLog: async (id, date) => {
    set({ isLoading: true, error: null });
    try {
      await client.graphql({
        query: deleteTrainingLog,
        variables: { id, date },
      });

      set((state) => ({
        logs: state.logs.filter((log) => log.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete log",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

import { create } from "zustand";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import type { TrainingLog } from "@/types/training-log";

const client = generateClient<Schema>();

interface TrainingLogsState {
  logs: TrainingLog[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLogs: () => Promise<void>;
  createLog: (log: Omit<TrainingLog, "id" | "createdAt" | "updatedAt" | "owner">) => Promise<void>;
  updateLog: (id: string, updates: Partial<TrainingLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTrainingLogsStore = create<TrainingLogsState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const allData: TrainingLog[] = [];
      let hasMore = true;
      let nextToken: string | null | undefined = undefined;

      // Fetch all pages
      while (hasMore) {
        const response: {
          data: TrainingLog[];
          nextToken: string | null | undefined;
        } = await client.models.TrainingLog.list({
          limit: 1000,
          nextToken: nextToken,
          authMode: "userPool",
        }) as any;
        
        allData.push(...response.data);
        nextToken = response.nextToken;
        hasMore = !!response.nextToken;
      }

      // Sort by date descending
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
      const response = await client.models.TrainingLog.create(
        {
          ...log,
          userId: "",
        },
        {
          authMode: "userPool",
        }
      );

      if (response.data) {
        set((state) => ({
          logs: [response.data as TrainingLog, ...state.logs],
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
      const response = await client.models.TrainingLog.update(
        {
          id,
          ...updates,
        },
        {
          authMode: "userPool",
        }
      );

      if (response.data) {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? (response.data as TrainingLog) : log
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

  deleteLog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await client.models.TrainingLog.delete(
        { id },
        {
          authMode: "userPool",
        }
      );

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

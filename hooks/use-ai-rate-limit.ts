import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

interface AiRateLimitStatus {
  canUseAi: boolean;
  remainingUses: number;
  dailyLimit: number;
  isLoading: boolean;
  error: string | null;
}

export function useAiRateLimit() {
  const [status, setStatus] = useState<AiRateLimitStatus>({
    canUseAi: true,
    remainingUses: 25,
    dailyLimit: 25,
    isLoading: true,
    error: null,
  });

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const checkRateLimit = async (): Promise<boolean> => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const user = await getCurrentUser();
      const today = getTodayDate();

      // Try to get today's usage record
      const { data: usageRecords } = await client.models.AiUsage.list({
        filter: {
          userId: { eq: user.userId },
          date: { eq: today },
        },
      });

      let currentUsage = usageRecords?.[0];

      if (!currentUsage) {
        // Create new usage record for today
        const { data: newUsage } = await client.models.AiUsage.create({
          userId: user.userId,
          date: today,
          count: 0,
          // Daily limit is set by the DB
          lastUpdated: new Date().toISOString(),
        });
        
        if (!newUsage) {
          throw new Error("Failed to create usage record");
        }
        
        currentUsage = newUsage;
      }

      if (!currentUsage) {
        throw new Error("Failed to fetch or create usage record");
      }

      // Handle null dailyLimit with fallback
      const dailyLimit = currentUsage.dailyLimit ?? 1000;
      const canUse = currentUsage.count < dailyLimit;
      const remaining = Math.max(0, dailyLimit - currentUsage.count);

      setStatus({
        canUseAi: canUse,
        remainingUses: remaining,
        dailyLimit: dailyLimit,
        isLoading: false,
        error: null,
      });

      return canUse;
    } catch (error) {
      console.error("Rate limit check error:", error);
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to check rate limit",
      }));
      return false;
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      const today = getTodayDate();

      // Get current usage
      const { data: usageRecords } = await client.models.AiUsage.list({
        filter: {
          userId: { eq: user.userId },
          date: { eq: today },
        },
      });

      const currentUsage = usageRecords?.[0];

      if (!currentUsage) {
        throw new Error("Usage record not found");
      }

      // Handle null dailyLimit with fallback
      const dailyLimit = currentUsage.dailyLimit ?? 1000;
      
      // Check if under limit
      if (currentUsage.count >= dailyLimit) {
        setStatus((prev) => ({
          ...prev,
          canUseAi: false,
          remainingUses: 0,
        }));
        return false;
      }

      // Increment usage
      const { data: updatedUsage } = await client.models.AiUsage.update({
        userId: user.userId,
        date: today,
        count: currentUsage.count + 1,
        lastUpdated: new Date().toISOString(),
      });

      if (updatedUsage) {
        const updatedDailyLimit = updatedUsage.dailyLimit ?? 1000;
        const remaining = Math.max(0, updatedDailyLimit - updatedUsage.count);
        setStatus({
          canUseAi: updatedUsage.count < updatedDailyLimit,
          remainingUses: remaining,
          dailyLimit: updatedDailyLimit,
          isLoading: false,
          error: null,
        });
      }

      return true;
    } catch (error) {
      console.error("Usage increment error:", error);
      setStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to increment usage",
      }));
      return false;
    }
  };

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit();
  }, []);

  return {
    ...status,
    checkRateLimit,
    incrementUsage,
    refresh: checkRateLimit,
  };
}

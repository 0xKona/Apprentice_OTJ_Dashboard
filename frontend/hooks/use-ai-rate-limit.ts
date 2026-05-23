import { useState, useEffect } from "react";
import { client } from "@/lib/api-client";
import { getAiUsage } from "@/lib/graphql/queries";

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

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const refresh = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const today = getTodayDate();
      const response: any = await client.graphql({
        query: getAiUsage,
        variables: { date: today },
      });

      const usage = response.data.getAiUsage;

      if (!usage) {
        // No record for today — full limit available
        setStatus((prev) => ({
          ...prev,
          canUseAi: true,
          remainingUses: prev.dailyLimit,
          isLoading: false,
        }));
        return;
      }

      const dailyLimit = usage.dailyLimit ?? 25;
      const remaining = Math.max(0, dailyLimit - usage.count);

      setStatus({
        canUseAi: usage.count < dailyLimit,
        remainingUses: remaining,
        dailyLimit,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to check rate limit",
      }));
    }
  };

  const setLimitReached = () => {
    setStatus((prev) => ({
      ...prev,
      canUseAi: false,
      remainingUses: 0,
    }));
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    ...status,
    refresh,
    setLimitReached,
  };
}

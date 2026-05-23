"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  onFetch: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export function DateRangeFilter({ onFetch, isLoading }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFetch = () => {
    onFetch(startDate, endDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filter by Date Range
        </CardTitle>
        <CardDescription>
          Select a date range to view and export logs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="end-date" className="text-sm font-medium">
              End Date
            </label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <Button
              onClick={handleFetch}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Loading..." : "Load Logs"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

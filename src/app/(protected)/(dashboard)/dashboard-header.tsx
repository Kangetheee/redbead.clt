"use client";

import { useState } from "react";
import { DateRangePicker, DateRange } from "@/components/ui/date-picker";

export interface DashboardHeaderProps {
  onDateRangeChange?: (range: DateRange) => void;
  initialDateRange?: DateRange;
}

export default function DashboardHeader({
  onDateRangeChange,
  initialDateRange,
}: DashboardHeaderProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange
  );

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Mama Bima Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here&rsquo;s what&rsquo;s happening around the platform.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          className="w-[280px]"
        />
      </div>
    </div>
  );
}

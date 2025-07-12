"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn, presetToDateRange } from "@/lib/utils";
import { DashboardPreset } from "@/lib/dashboard/types/dashboard.types";

export interface DateRange {
  from: Date;
  to: Date;
  preset?: string;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
}

const presetConfigs: Array<{
  label: string;
  value: DashboardPreset;
}> = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "Last 90 days", value: "last_90_days" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "Last Quarter", value: "last_quarter" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
];

export function DateRangePicker({
  value,
  onChange,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setTempRange(value);
      setSelectedPreset(value?.preset || "");
    }
  }, [isOpen, value]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDisplayText = () => {
    if (!value) return "Select date range";

    if (value.from.toDateString() === value.to.toDateString()) {
      return formatDate(value.from);
    }

    return `${formatDate(value.from)} - ${formatDate(value.to)}`;
  };

  const handlePresetSelect = (presetConfig: (typeof presetConfigs)[0]) => {
    const range = presetToDateRange(presetConfig.value);
    const rangeWithPreset = {
      ...range,
      preset: presetConfig.value,
    };
    setTempRange(rangeWithPreset);
    setSelectedPreset(presetConfig.value);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    // Clear preset when manually selecting dates
    setSelectedPreset("");

    if (!tempRange?.from || (tempRange.from && tempRange.to)) {
      // Start new selection
      setTempRange({ from: date, to: date, preset: undefined });
    } else if (tempRange.from && !tempRange.to) {
      // Complete the range
      if (date < tempRange.from) {
        setTempRange({ from: date, to: tempRange.from, preset: undefined });
      } else {
        setTempRange({ from: tempRange.from, to: date, preset: undefined });
      }
    } else {
      // Reset and start new selection
      setTempRange({ from: date, to: date, preset: undefined });
    }
  };

  // Handle update/apply
  const handleUpdate = () => {
    if (tempRange && onChange) {
      onChange(tempRange);
    }
    setIsOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setTempRange(value);
    setSelectedPreset(value?.preset || "");
    setIsOpen(false);
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Generate calendar days
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (!tempRange?.from || !tempRange?.to) return false;
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const fromDate = new Date(
      tempRange.from.getFullYear(),
      tempRange.from.getMonth(),
      tempRange.from.getDate()
    );
    const toDate = new Date(
      tempRange.to.getFullYear(),
      tempRange.to.getMonth(),
      tempRange.to.getDate()
    );

    return normalizedDate >= fromDate && normalizedDate <= toDate;
  };

  // Check if date is start or end of range
  const isSelected = (date: Date) => {
    if (!tempRange?.from) return false;
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const fromDate = new Date(
      tempRange.from.getFullYear(),
      tempRange.from.getMonth(),
      tempRange.from.getDate()
    );

    if (!tempRange.to) {
      return normalizedDate.getTime() === fromDate.getTime();
    }

    const toDate = new Date(
      tempRange.to.getFullYear(),
      tempRange.to.getMonth(),
      tempRange.to.getDate()
    );
    return (
      normalizedDate.getTime() === fromDate.getTime() ||
      normalizedDate.getTime() === toDate.getTime()
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-between text-left font-normal min-w-[280px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Card>
          <CardContent className="p-0">
            <div className="flex">
              {/* Calendar Section */}
              <div className="p-4 border-r">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex space-x-8">
                    <h3 className="text-sm font-medium min-w-[120px] text-center">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h3>
                    <h3 className="text-sm font-medium min-w-[120px] text-center">
                      {
                        monthNames[
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1
                          ).getMonth()
                        ]
                      }{" "}
                      {new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      ).getFullYear()}
                    </h3>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="flex space-x-4">
                  {/* First Month */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground p-2"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Date cells */}
                    {generateCalendarDays(currentMonth).map((date, index) => {
                      const isCurrentMonth =
                        date.getMonth() === currentMonth.getMonth();
                      const isToday =
                        date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          className={cn(
                            "p-2 text-xs hover:bg-accent hover:text-accent-foreground rounded-md transition-colors w-8 h-8 flex items-center justify-center",
                            !isCurrentMonth && "text-muted-foreground/50",
                            isToday && "bg-accent font-medium",
                            isSelected(date) &&
                              "bg-primary text-primary-foreground",
                            isInRange(date) &&
                              !isSelected(date) &&
                              "bg-primary/20"
                          )}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Second Month */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {dayNames.map((day) => (
                      <div
                        key={`next-${day}`}
                        className="text-center text-xs font-medium text-muted-foreground p-2"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Date cells */}
                    {generateCalendarDays(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    ).map((date, index) => {
                      const nextMonth = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      );
                      const isCurrentMonth =
                        date.getMonth() === nextMonth.getMonth();
                      const isToday =
                        date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={`next-${index}`}
                          onClick={() => handleDateSelect(date)}
                          className={cn(
                            "p-2 text-xs hover:bg-accent hover:text-accent-foreground rounded-md transition-colors w-8 h-8 flex items-center justify-center",
                            !isCurrentMonth && "text-muted-foreground/50",
                            isToday && "bg-accent font-medium",
                            isSelected(date) &&
                              "bg-primary text-primary-foreground",
                            isInRange(date) &&
                              !isSelected(date) &&
                              "bg-primary/20"
                          )}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Presets Section */}
              <div className="w-48 p-4">
                <div className="space-y-1">
                  {presetConfigs.map((presetConfig) => (
                    <button
                      key={presetConfig.value}
                      onClick={() => handlePresetSelect(presetConfig)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between",
                        selectedPreset === presetConfig.value && "bg-accent"
                      )}
                    >
                      {presetConfig.label}
                      {selectedPreset === presetConfig.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 p-4 border-t">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={!tempRange?.from}
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

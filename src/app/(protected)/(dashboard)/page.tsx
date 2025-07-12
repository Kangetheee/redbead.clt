"use client";

import { Suspense, useState } from "react";
import BotPerformance from "./bot-performance";
import ConversationInsights from "./conversation-insights";
import DashboardHeader from "./dashboard-header";
import { ErrorBoundary } from "./error-boundary";
import ErrorCard from "./error-card";
import GlanceMetrics from "./glance-metrics";
import LoadingCard from "./loading-card";
import LoadingIndicator from "./loading-indicator";
import PlanRecommendations from "./plan-recommendations";
import UpcomingTasks from "./upcoming-tasks";
import UserActivity from "./user-activity";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";
import { dateRangeToQuery, presetToDateRange } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
}

export default function DashboardPage() {
  // Initialize with default preset (last 7 days)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    return presetToDateRange("last_7_days");
  });

  // Convert DateRange to DashboardSummaryQuery using preset detection
  const getDashboardQuery = (): DashboardSummaryQuery => {
    return dateRangeToQuery(dateRange);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const dashboardQuery = getDashboardQuery();

  // Debug log to see what's being sent
  // console.log("Dashboard query:", dashboardQuery);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4 md:p-6 space-y-6 pb-10">
        <DashboardHeader
          onDateRangeChange={handleDateRangeChange}
          initialDateRange={dateRange}
        />

        <ErrorBoundary fallback={<ErrorCard title="At-a-Glance Metrics" />}>
          <Suspense fallback={<LoadingIndicator />}>
            <GlanceMetrics query={dashboardQuery} />
          </Suspense>
        </ErrorBoundary>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ErrorBoundary
              fallback={<ErrorCard title="Conversation Insights" />}
            >
              <Suspense
                fallback={<LoadingCard title="Conversation Insights" />}
              >
                <ConversationInsights query={dashboardQuery} />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="xl:row-span-2 md:col-span-2 lg:col-span-1">
            <ErrorBoundary
              fallback={<ErrorCard title="Plan Recommendations & Uptake" />}
            >
              <Suspense
                fallback={<LoadingCard title="Plan Recommendations & Uptake" />}
              >
                <PlanRecommendations query={dashboardQuery} />
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="md:col-span-2">
            <ErrorBoundary
              fallback={<ErrorCard title="Bot & AI Performance" />}
            >
              <Suspense fallback={<LoadingCard title="Bot & AI Performance" />}>
                <BotPerformance query={dashboardQuery} />
              </Suspense>
            </ErrorBoundary>
          </div>

          <ErrorBoundary fallback={<ErrorCard title="User & Role Activity" />}>
            <Suspense fallback={<LoadingCard title="User & Role Activity" />}>
              <UserActivity query={dashboardQuery} />
            </Suspense>
          </ErrorBoundary>

          <div className="md:col-span-2 xl:col-span-1">
            <ErrorBoundary
              fallback={<ErrorCard title="Upcoming Tasks & Alerts" />}
            >
              <Suspense
                fallback={<LoadingCard title="Upcoming Tasks & Alerts" />}
              >
                <UpcomingTasks query={dashboardQuery} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}

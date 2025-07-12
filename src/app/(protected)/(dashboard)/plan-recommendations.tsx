"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart } from "@/components/ui/charts";
import { ChartBarIcon, TrendingUpIcon } from "lucide-react";
import {
  useRevenueMetrics,
  useUnderwriterPerformance,
} from "@/hooks/use-dashboard";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";
import LoadingCard from "./loading-card";
import ErrorCard from "./error-card";

interface PlanRecommendationsProps {
  query?: DashboardSummaryQuery;
}

export default function PlanRecommendations({
  query,
}: PlanRecommendationsProps) {
  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useRevenueMetrics(query);

  const {
    data: underwriterData,
    isLoading: isLoadingUnderwriters,
    error: underwriterError,
  } = useUnderwriterPerformance(query);

  const isLoading = isLoadingRevenue || isLoadingUnderwriters;
  const error = revenueError || underwriterError;

  if (isLoading) {
    return <LoadingCard title="Plan Recommendations & Uptake" />;
  }

  if (error) {
    return <ErrorCard title="Plan Recommendations & Uptake" />;
  }

  if (!revenueData || !underwriterData) {
    return <ErrorCard title="Plan Recommendations & Uptake" />;
  }

  // Transform revenue data for chart
  const revenueByFrequency =
    revenueData.byFrequency.length > 0
      ? revenueData.byFrequency.map((item) => ({
          frequency: item.frequency,
          amount: item.amount,
        }))
      : [
          { frequency: "Monthly", amount: 0 },
          { frequency: "Quarterly", amount: 0 },
          { frequency: "Semi-Annual", amount: 0 },
          { frequency: "Annual", amount: 0 },
        ];

  // Transform underwriter data for display
  const totalUnderwriterRevenue = underwriterData.reduce(
    (sum, uw) => sum + uw.revenue,
    0
  );
  const underwriterPercentages = underwriterData.map((uw) => ({
    name: uw.name,
    value:
      totalUnderwriterRevenue > 0
        ? Math.round((uw.revenue / totalUnderwriterRevenue) * 100)
        : 0,
    plansCount: uw.plansCount,
    clientsCount: uw.clientsCount,
  }));

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Plan Recommendations & Uptake</CardTitle>
        <CardDescription>
          Performance metrics for insurance plans
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] overflow-auto">
        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-2">
              <ChartBarIcon className="h-4 w-4 text-amber-500 mr-2" />
              <h4 className="text-sm font-medium">
                Revenue by Payment Frequency
              </h4>
            </div>
            {revenueByFrequency.some((item) => item.amount > 0) ? (
              <>
                <div className="h-[140px]">
                  <BarChart
                    data={revenueByFrequency}
                    index="frequency"
                    categories={["amount"]}
                    colors={["#16a34a"]}
                    valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    showLegend={false}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <p>
                    Total recurring revenue:{" "}
                    <span className="font-medium">
                      ${revenueData.totalMonthlyRevenue.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Monthly revenue:{" "}
                    <span className="font-medium text-emerald-500">
                      ${revenueData.totalMonthlyRevenue.toLocaleString()}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[140px] text-muted-foreground">
                <div className="text-center">
                  <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No revenue data available</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center mb-2">
              <TrendingUpIcon className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium">Underwriter Performance</h4>
            </div>
            {underwriterPercentages.length > 0 ? (
              <div className="space-y-2">
                {underwriterPercentages
                  .slice(0, 4)
                  .map((underwriter, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm">{underwriter.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {underwriter.plansCount} plans,{" "}
                          {underwriter.clientsCount} clients
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden mr-2">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${underwriter.value}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {underwriter.value}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[80px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUpIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
                  <p className="text-sm">No underwriter data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

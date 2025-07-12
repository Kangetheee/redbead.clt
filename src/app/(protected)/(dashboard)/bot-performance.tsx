"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircularProgressBar } from "@/components/ui/circular-progress-bar";
import { BotIcon, CheckSquare, MessageSquare, Star } from "lucide-react";
import { useBotPerformance } from "@/hooks/use-dashboard";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";

interface BotPerformanceProps {
  query?: DashboardSummaryQuery;
}

export default function BotPerformance({ query }: BotPerformanceProps) {
  const { data: performance, isLoading, error } = useBotPerformance(query);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Bot & AI Performance</CardTitle>
          <CardDescription>Loading bot performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !performance) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Bot & AI Performance</CardTitle>
          <CardDescription>Failed to load bot performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>Unable to load bot performance metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const botMetrics = [
    {
      name: "Active Bots",
      value: `${performance.activeBots.active}/${performance.activeBots.total}`,
      icon: BotIcon,
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      name: "Questions Asked",
      value: performance.questionsAsked.toLocaleString(),
      icon: MessageSquare,
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    {
      name: "Satisfaction Rate",
      value: `${performance.clientFeedback.satisfactionRate}%`,
      icon: CheckSquare,
      color: "bg-green-500",
      textColor: "text-green-500",
    },
  ];

  // Generate a simple distribution based on average rating for visualization
  const generateDistribution = (avgRating: number, total: number) => {
    if (total === 0) return [0, 0, 0, 0, 0];

    const distribution = [0, 0, 0, 0, 0];
    const peakIndex = Math.max(0, Math.min(4, Math.floor(avgRating) - 1));
    const remainder = avgRating - Math.floor(avgRating);

    // Distribute ratings around the average
    distribution[peakIndex] = Math.floor(total * (0.4 + remainder * 0.3));
    if (peakIndex < 4) {
      distribution[peakIndex + 1] = Math.floor(total * (0.3 - remainder * 0.2));
    }
    if (peakIndex > 0) {
      distribution[peakIndex - 1] = Math.floor(total * (0.2 - remainder * 0.1));
    }

    // Fill remaining
    const used = distribution.reduce((sum, val) => sum + val, 0);
    const remaining = total - used;
    if (remaining > 0) {
      distribution[peakIndex] += remaining;
    }

    return distribution;
  };

  const feedbackDistribution = generateDistribution(
    performance.clientFeedback.averageRating,
    performance.clientFeedback.totalRatings
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Bot & AI Performance</CardTitle>
        <CardDescription>Metrics for automated conversations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {botMetrics.map((metric, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:shadow-sm transition-all duration-200"
              >
                <div className={`p-2 rounded-full ${metric.color} mb-2`}>
                  <metric.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium">{metric.name}</p>
                <p className={`text-lg font-bold ${metric.textColor}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Client Feedback */}
            <div className="space-y-2 lg:col-span-2">
              <h4 className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 text-amber-500 mr-2" />
                Client Feedback
              </h4>
              {performance.clientFeedback.totalRatings > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">Rating distribution</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <div
                          key={stars}
                          className="relative w-8 h-16 bg-muted rounded"
                        >
                          <div
                            className="absolute bottom-0 w-full bg-amber-500 rounded-b"
                            style={{
                              height: `${
                                performance.clientFeedback.totalRatings > 0
                                  ? (feedbackDistribution[stars - 1] /
                                      performance.clientFeedback.totalRatings) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                          <div className="absolute bottom-0 w-full text-center text-xs -mb-5">
                            {stars}★
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20">
                      <CircularProgressBar
                        percentage={performance.clientFeedback.satisfactionRate}
                        size={80}
                        strokeWidth={8}
                        circleColor="#f59e0b"
                        label="Satisfaction"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xl ${
                              star <=
                              Math.round(
                                performance.clientFeedback.averageRating
                              )
                                ? "text-amber-500"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-medium mt-1">
                        <span className="text-lg">
                          {performance.clientFeedback.averageRating.toFixed(1)}
                        </span>
                        /5
                      </p>
                      <p className="text-xs text-muted-foreground">
                        From {performance.clientFeedback.totalRatings} ratings
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[120px] text-muted-foreground">
                  <div className="text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm">No feedback data available</p>
                    <p className="text-xs">
                      Ratings will appear when customers provide feedback
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

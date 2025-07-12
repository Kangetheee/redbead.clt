"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { useTopMetrics } from "@/hooks/use-dashboard";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";
import LoadingCard from "./loading-card";
import ErrorCard from "./error-card";

const metricConfigs = [
  {
    key: "activeClients" as const,
    title: "Active Clients",
    description: "Total with complete profiles",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    key: "newClients" as const,
    title: "New Clients",
    description: "Joined this period",
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    key: "activeConversations" as const,
    title: "Active Conversations",
    description: "Currently ongoing",
    icon: MessageSquare,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
  },
  {
    key: "pendingFollowUps" as const,
    title: "Pending Follow-Ups",
    description: "Due within period",
    icon: Calendar,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
  },
  {
    key: "plansInForce" as const,
    title: "Plans In-Force",
    description: "Across all underwriters",
    icon: ShieldCheck,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
  },
];

interface GlanceMetricsGridProps {
  query?: DashboardSummaryQuery;
}

export default function GlanceMetricsGrid({ query }: GlanceMetricsGridProps) {
  const { data: metrics, isLoading, error } = useTopMetrics(query);

  if (isLoading) {
    return <LoadingCard title="At-a-Glance Metrics" />;
  }

  if (error) {
    return <ErrorCard title="At-a-Glance Metrics" />;
  }

  if (!metrics) {
    return <ErrorCard title="At-a-Glance Metrics" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {metricConfigs.map((config, index) => {
        const metricData = metrics[config.key];
        const isIncreasing = metricData.change >= 0;

        return (
          <Card
            key={index}
            className="overflow-hidden border border-muted hover:border-primary/20 transition-all duration-200"
          >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className={`p-3 ${config.bgColor}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm">{config.title}</h3>
                    <div
                      className={`p-2 rounded-full ${config.bgColor} border border-current ${config.color}`}
                    >
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">
                      {metricData.value.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        isIncreasing
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncreasing ? "+" : ""}
                      {metricData.change.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

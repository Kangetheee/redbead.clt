"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  ChevronRight,
  Clock,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { useUpcomingTasks } from "@/hooks/use-dashboard";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";
import LoadingCard from "./loading-card";
import ErrorCard from "./error-card";

const priorityColors = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-300 dark:border-rose-800",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-300 dark:border-amber-800",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
};

const severityColors = {
  critical:
    "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-400",
  warning:
    "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400",
  info: "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400",
};

const alertIcons = {
  channel: RefreshCw,
  verification: AlertCircle,
  system: MessageSquare,
  default: AlertCircle,
};

interface UpcomingTasksProps {
  query?: DashboardSummaryQuery;
}

export default function UpcomingTasks({ query }: UpcomingTasksProps) {
  const { data: tasks, isLoading, error } = useUpcomingTasks(query);

  if (isLoading) {
    return <LoadingCard title="Upcoming Tasks & Alerts" />;
  }

  if (error) {
    return <ErrorCard title="Upcoming Tasks & Alerts" />;
  }

  if (!tasks) {
    return <ErrorCard title="Upcoming Tasks & Alerts" />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Upcoming Tasks & Alerts</CardTitle>
        <CardDescription>
          Scheduled follow-ups and system notices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <CalendarClock className="h-4 w-4 text-blue-500 mr-2" />
                Scheduled Follow-Ups
              </h4>
              <Badge variant="outline" className="text-xs">
                Selected period
              </Badge>
            </div>
            {tasks.followUps.length > 0 ? (
              <ScrollArea className="h-[180px] pr-4">
                <div className="space-y-3">
                  {tasks.followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className={`flex items-start space-x-3 p-2 rounded-lg border ${
                        priorityColors[followUp.priority]
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium truncate">
                            {followUp.clientName}
                          </p>
                          <Badge
                            variant="outline"
                            className={`ml-2 border-0 ${
                              priorityColors[followUp.priority]
                            }`}
                          >
                            {followUp.priority}
                          </Badge>
                        </div>
                        <p className="text-xs mt-1">{followUp.type}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(followUp.dueDate)}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatTime(followUp.dueDate)}</span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground">
                <div className="text-center">
                  <CalendarClock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No upcoming follow-ups</p>
                  <p className="text-xs">
                    Follow-ups will appear when scheduled
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 text-rose-500 mr-2" />
                System Alerts
              </h4>
              <Badge variant="outline" className="text-xs">
                {tasks.systemAlerts.length} alerts
              </Badge>
            </div>
            {tasks.systemAlerts.length > 0 ? (
              <div className="space-y-3">
                {tasks.systemAlerts.map((alert) => {
                  const AlertIcon =
                    alertIcons[alert.type as keyof typeof alertIcons] ||
                    alertIcons.default;

                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        severityColors[
                          alert.type as keyof typeof severityColors
                        ] || severityColors.info
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertIcon className="h-4 w-4 mr-2" />
                          <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`border-0 ${
                            severityColors[
                              alert.type as keyof typeof severityColors
                            ] || severityColors.info
                          }`}
                        >
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-xs ml-6 mt-1">
                        Created:{" "}
                        {new Date(alert.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No system alerts</p>
                  <p className="text-xs">
                    Alerts will appear when there are issues
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { useUserActivity } from "@/hooks/use-dashboard";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";
import LoadingCard from "./loading-card";
import ErrorCard from "./error-card";

interface UserActivityProps {
  query?: DashboardSummaryQuery;
}

export default function UserActivity({ query }: UserActivityProps) {
  const { data: userActivity, isLoading, error } = useUserActivity(query);

  if (isLoading) {
    return <LoadingCard title="User & Role Activity" />;
  }

  if (error) {
    return <ErrorCard title="User & Role Activity" />;
  }

  if (!userActivity) {
    return <ErrorCard title="User & Role Activity" />;
  }

  const formatLastActive = (lastActiveString: string) => {
    const lastActive = new Date(lastActiveString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>User & Role Activity</CardTitle>
        <CardDescription>Recent account and permission changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Active Users Section - Using real API data */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 text-indigo-500 mr-2" />
                Recent Active Users
              </h4>
              <Badge variant="outline" className="text-xs">
                View all
              </Badge>
            </div>
            {userActivity.length > 0 ? (
              <div className="space-y-3">
                {userActivity.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.actionsCount} actions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatLastActive(user.lastActive)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No recent user activity</p>
                  <p className="text-xs">
                    Activity will appear when users are active
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

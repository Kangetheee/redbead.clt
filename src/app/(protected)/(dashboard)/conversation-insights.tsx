"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart, PieChart } from "@/components/ui/charts";
import { MessageSquare } from "lucide-react";
import { useConversationInsights } from "@/hooks/use-dashboard";
import { DashboardSummaryQuery } from "@/lib/dashboard/types/dashboard.types";

interface ConversationInsightsProps {
  query?: DashboardSummaryQuery;
}

export default function ConversationInsights({
  query,
}: ConversationInsightsProps) {
  const { data: insights, isLoading, error } = useConversationInsights(query);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Conversation Insights</CardTitle>
          <CardDescription>Loading conversation data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insights) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Conversation Insights</CardTitle>
          <CardDescription>Failed to load conversation data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>Unable to load conversation insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform weeklyData for LineChart
  const conversationVolume = insights.weeklyData.map((day) => ({
    name: day.date,
    value: day.total,
  }));

  // Transform weeklyData for PieChart - calculate totals by channel
  const channelTotals = insights.weeklyData.reduce(
    (acc, day) => ({
      whatsapp: acc.whatsapp + day.whatsapp,
      sms: acc.sms + day.sms,
      instagram: acc.instagram + day.instagram,
      email: acc.email + day.email,
    }),
    { whatsapp: 0, sms: 0, instagram: 0, email: 0 }
  );

  const totalConversations = Object.values(channelTotals).reduce(
    (sum, val) => sum + val,
    0
  );

  const channelUsage = [
    {
      name: "WhatsApp",
      value:
        totalConversations > 0
          ? Math.round((channelTotals.whatsapp / totalConversations) * 100)
          : 0,
    },
    {
      name: "SMS",
      value:
        totalConversations > 0
          ? Math.round((channelTotals.sms / totalConversations) * 100)
          : 0,
    },
    {
      name: "Instagram",
      value:
        totalConversations > 0
          ? Math.round((channelTotals.instagram / totalConversations) * 100)
          : 0,
    },
    {
      name: "Email",
      value:
        totalConversations > 0
          ? Math.round((channelTotals.email / totalConversations) * 100)
          : 0,
    },
  ];

  // Calculate period stats
  const periodTotal = insights.weeklyData.reduce(
    (sum, day) => sum + day.total,
    0
  );
  const averageDaily = periodTotal / insights.weeklyData.length;
  const topChannel = channelUsage.reduce((prev, current) =>
    prev.value > current.value ? prev : current
  );

  // Format response time - convert seconds to appropriate unit
  const formatResponseTime = (seconds: number) => {
    if (seconds === 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conversation Insights</CardTitle>
            <CardDescription>
              Trends and patterns in client conversations
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Volume Chart */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Daily Conversation Volume</h3>
            <div className="h-[180px] mt-4">
              <LineChart
                data={conversationVolume}
                index="name"
                categories={["value"]}
                colors={["#2563eb"]}
                valueFormatter={(value) => `${value} conversations`}
                showLegend={false}
                showXAxis={true}
                showYAxis={true}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <p>Period total: {periodTotal}</p>
              <p>Average: {averageDaily.toFixed(1)} per day</p>
            </div>
          </div>

          {/* Channel Usage Breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Channel Usage Breakdown</h3>
            <div className="h-[180px] mt-4">
              <PieChart
                data={channelUsage}
                index="name"
                categories={["value"]}
                colors={["#16a34a", "#2563eb", "#d946ef", "#f97316"]}
                valueFormatter={(value) => `${value}%`}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <p>
                Most used: {topChannel.name} ({topChannel.value}%)
              </p>
              <p>Total conversations: {totalConversations}</p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Conversation Rate</p>
              </div>
              <p className="text-xl font-bold mt-1">
                {insights.metrics.conversationRate}%
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Contact-to-conversation
              </p>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Response Time</p>
              </div>
              <p className="text-xl font-bold mt-1">
                {formatResponseTime(insights.metrics.averageResponseTime)}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Average first response
              </p>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Completion Rate</p>
              </div>
              <p className="text-xl font-bold mt-1">
                {insights.metrics.completionRate}%
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Conversations completed
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

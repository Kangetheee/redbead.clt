"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useOrders } from "@/hooks/use-orders";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderResponse } from "@/lib/orders/types/orders.types";

export default function RevenueChart() {
  const { data: ordersData, isLoading } = useOrders({
    limit: 500,
  });

  // Generate chart data based on real revenue data only
  const chartData = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const orders: OrderResponse[] = ordersData?.data?.items || [];

    if (orders.length === 0) {
      return []; // Return empty array - no fallback data
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const data = [];

    // Generate data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = monthNames[date.getMonth()];

      // Calculate revenue for this month using real data only
      const monthlyRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      data.push({
        name: monthName,
        revenue: monthlyRevenue,
      });
    }

    return data;
  }, [ordersData, isLoading]);

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  // If no data, show empty chart message
  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No revenue data available</p>
          <p className="text-xs mt-1">
            Revenue will appear when orders are created
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value}`, "Revenue"]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

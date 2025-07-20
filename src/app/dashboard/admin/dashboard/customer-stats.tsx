"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCustomers } from "@/hooks/use-customers";
import { useOrders } from "@/hooks/use-orders";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerResponse } from "@/lib/customers/types/customers.types";
import { OrderResponse } from "@/lib/orders/types/orders.types";

export default function CustomerStats() {
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    limit: 100,
  });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    limit: 100,
  });

  // Generate chart data based on real data only
  const chartData = useMemo(() => {
    if (customersLoading || ordersLoading) {
      return [];
    }

    const customers: CustomerResponse[] = customersData?.items || [];
    const orders: OrderResponse[] = ordersData?.data?.items || [];

    if (customers.length === 0 && orders.length === 0) {
      return []; // Return empty array - no fallback data
    }

    // Generate monthly data for the last 6 months
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

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = monthNames[date.getMonth()];

      // Calculate new customers for this month
      const newCustomersThisMonth = customers.filter(
        (customer: CustomerResponse) => {
          const customerDate = new Date(customer.createdAt);
          return (
            customerDate.getMonth() === date.getMonth() &&
            customerDate.getFullYear() === date.getFullYear()
          );
        }
      ).length;

      // Calculate returning customers (customers who had orders this month but were created before)
      const returningCustomersThisMonth = orders.filter(
        (order: OrderResponse) => {
          const orderDate = new Date(order.createdAt);
          if (
            orderDate.getMonth() !== date.getMonth() ||
            orderDate.getFullYear() !== date.getFullYear()
          ) {
            return false;
          }

          // Check if customer was created before this month
          const customer = customers.find(
            (c: CustomerResponse) => c.id === order.customerId
          );
          if (!customer) return false;

          const customerDate = new Date(customer.createdAt);
          return customerDate < date;
        }
      ).length;

      data.push({
        name: monthName,
        new: newCustomersThisMonth,
        returning: returningCustomersThisMonth,
      });
    }

    return data;
  }, [customersData, ordersData, customersLoading, ordersLoading]);

  if (customersLoading || ordersLoading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  // If no data, show empty chart
  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No customer data available</p>
          <p className="text-xs mt-1">
            Data will appear when customers and orders are created
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        />
        <Bar
          dataKey="new"
          fill="#4f46e5"
          radius={[4, 4, 0, 0]}
          name="New Customers"
        />
        <Bar
          dataKey="returning"
          fill="#818cf8"
          radius={[4, 4, 0, 0]}
          name="Returning Customers"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

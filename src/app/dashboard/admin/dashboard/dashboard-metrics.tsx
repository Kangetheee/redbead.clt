"use client";

import { Users, ShoppingBag, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useCustomers } from "@/hooks/use-customers";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function DashboardMetrics() {
  // Get data from hooks
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    limit: 500, // Get more data for calculations
  });

  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 100,
    isActive: true,
  });

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    limit: 500,
  });

  // Calculate metrics using real data only
  const metrics = useMemo(() => {
    const defaultMetrics = {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalOrders: 0,
      ordersGrowth: 0,
      totalCustomers: 0,
      customersGrowth: 0,
      activeProducts: 0,
      productsGrowth: 0,
    };

    const orders = ordersData?.data?.data || [];
    const products = productsData?.data || [];
    const customers = customersData?.data || [];

    if (
      orders.length === 0 &&
      products.length === 0 &&
      customers.length === 0
    ) {
      return defaultMetrics; // Return zeros if no data
    }

    // Calculate total revenue from real orders
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // Calculate revenue growth (current month vs last month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const lastMonthRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === lastMonth &&
          orderDate.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Calculate orders growth
    const currentMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    }).length;

    const lastMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === lastMonth &&
        orderDate.getFullYear() === lastMonthYear
      );
    }).length;

    const ordersGrowth =
      lastMonthOrders > 0
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    // Calculate customers growth
    const currentMonthCustomers = customers.filter((customer) => {
      const customerDate = new Date(customer.createdAt);
      return (
        customerDate.getMonth() === currentMonth &&
        customerDate.getFullYear() === currentYear
      );
    }).length;

    const lastMonthCustomers = customers.filter((customer) => {
      const customerDate = new Date(customer.createdAt);
      return (
        customerDate.getMonth() === lastMonth &&
        customerDate.getFullYear() === lastMonthYear
      );
    }).length;

    const customersGrowth =
      lastMonthCustomers > 0
        ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) *
          100
        : 0;

    // Calculate products growth
    const currentMonthProducts = products.filter((product) => {
      const productDate = new Date(product.createdAt);
      return (
        productDate.getMonth() === currentMonth &&
        productDate.getFullYear() === currentYear
      );
    }).length;

    const lastMonthProducts = products.filter((product) => {
      const productDate = new Date(product.createdAt);
      return (
        productDate.getMonth() === lastMonth &&
        productDate.getFullYear() === lastMonthYear
      );
    }).length;

    const productsGrowth =
      lastMonthProducts > 0
        ? ((currentMonthProducts - lastMonthProducts) / lastMonthProducts) * 100
        : 0;

    return {
      totalRevenue,
      revenueGrowth,
      totalOrders: orders.length,
      ordersGrowth,
      totalCustomers: customers.length,
      customersGrowth,
      activeProducts: products.length,
      productsGrowth,
    };
  }, [ordersData, productsData, customersData]);

  if (ordersLoading || productsLoading || customersLoading) {
    return <MetricsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {/* ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} */}
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.revenueGrowth >= 0 ? "+" : ""}
            {metrics.revenueGrowth.toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalOrders.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.ordersGrowth >= 0 ? "+" : ""}
            {metrics.ordersGrowth.toFixed(1)}% since last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalCustomers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.customersGrowth >= 0 ? "+" : ""}
            {metrics.customersGrowth.toFixed(1)}% since last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.activeProducts.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.productsGrowth >= 0 ? "+" : ""}
            {metrics.productsGrowth.toFixed(1)}% added this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

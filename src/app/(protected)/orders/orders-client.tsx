/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Download,
  Filter,
  RefreshCw,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";
import OrderTable from "@/components/orders/orders-table";
import { toast } from "sonner";

export default function OrdersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<GetOrdersDto>(() => {
    const initialFilters: GetOrdersDto = {};

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const minTotal = searchParams.get("minTotal");
    const maxTotal = searchParams.get("maxTotal");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (status) initialFilters.status = status;
    if (search) initialFilters.search = search;
    if (minTotal) initialFilters.minTotal = parseFloat(minTotal);
    if (maxTotal) initialFilters.maxTotal = parseFloat(maxTotal);
    if (startDate) initialFilters.startDate = startDate;
    if (endDate) initialFilters.endDate = endDate;

    return initialFilters;
  });

  // State for bulk operations
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch orders data for overview stats
  const { data: ordersData, isLoading, error, refetch } = useOrders(filters);

  // Calculate overview statistics
  const orderStats = useMemo(() => {
    if (!ordersData?.items) return null;

    const orders = ordersData.items;
    const total = orders.length;
    const pending = orders.filter((o) =>
      ["PENDING", "CONFIRMED", "DESIGN_PENDING"].includes(o.status)
    ).length;
    const processing = orders.filter((o) =>
      ["PROCESSING", "PRODUCTION"].includes(o.status)
    ).length;
    const shipped = orders.filter((o) =>
      ["SHIPPED", "DELIVERED"].includes(o.status)
    ).length;
    const needsAttention = orders.filter(
      (o) =>
        o.status === "DESIGN_PENDING" ||
        o.status === "PAYMENT_PENDING" ||
        (o.designApprovalRequired && !o.designApprovalStatus)
    ).length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    return {
      total,
      pending,
      processing,
      shipped,
      needsAttention,
      totalRevenue,
      avgOrderValue,
    };
  }, [ordersData]);

  // Handle filter changes and update URL
  const handleFiltersChange = useCallback(
    (newFilters: GetOrdersDto) => {
      setFilters(newFilters);

      // Update URL search params
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      });

      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router]
  );

  // Handle bulk export
  const handleBulkExport = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to export");
      return;
    }

    setIsExporting(true);
    try {
      // TODO: Implement actual export functionality
      console.log("Exporting orders:", selectedOrders);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Successfully exported ${selectedOrders.length} orders`);
      setSelectedOrders([]);
    } catch (error) {
      toast.error("Failed to export orders");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast.success("Orders refreshed");
  };

  // Handle order click navigation
  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    router.replace(window.location.pathname, { scroll: false });
  };

  // Check if filters are active
  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof GetOrdersDto] !== undefined &&
      filters[key as keyof GetOrdersDto] !== null &&
      filters[key as keyof GetOrdersDto] !== ""
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {/* Bulk Export Button */}
          {selectedOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedOrders.length})
            </Button>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Create Order Button */}
          <Button asChild>
            <Link href="/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {orderStats && !isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.total}</div>
              <p className="text-xs text-muted-foreground">
                ${orderStats.totalRevenue.toFixed(2)} total revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Processing & production
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.shipped}</div>
              <p className="text-xs text-muted-foreground">
                Shipped & delivered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Required Alert */}
      {orderStats && orderStats.needsAttention > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{orderStats.needsAttention} orders</strong> need your
            attention. Review design approvals, payment confirmations, or other
            pending actions.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Filters Display
      {hasActiveFilters && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                Active filters:
              </span>
              {filters.status && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Status: {filters.status}
                </Badge>
              )}
              {filters.search && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Search: &quot;{filters.search}&quot;
                </Badge>
              )}
              {filters.minTotal && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Min: ${filters.minTotal}
                </Badge>
              )}
              {filters.maxTotal && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Max: ${filters.maxTotal}
                </Badge>
              )}
              {filters.startDate && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  From: {filters.startDate}
                </Badge>
              )}
              {filters.endDate && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  To: {filters.endDate}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Orders Table */}
      <OrderTable
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showFilters={true}
        compact={false}
        pageSize={15}
        onOrderClick={handleOrderClick}
      />

      {/* Quick Actions Footer */}
      {selectedOrders.length > 0 && (
        <Card className="sticky bottom-4 border-primary shadow-lg">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedOrders.length} orders selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear selection
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export Selected"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

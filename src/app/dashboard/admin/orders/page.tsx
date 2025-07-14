/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Filter,
  Download,
  RefreshCw,
  CheckSquare,
  AlertTriangle,
  Clock,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import AdvancedOrderSearch from "@/components/orders/advanced-orders-search";
import OrdersList from "@/components/orders/orders-list";
import BulkOperations from "@/components/orders/bulk-operations";
import OrderExport from "@/components/orders/order-export";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { useOrders } from "@/hooks/use-orders";

export default function AdminOrdersPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState<GetOrdersDto>({
    page: 1,
    limit: 20,
  });

  // Fetch orders data
  const { data: ordersData, isLoading, refetch } = useOrders(filters);
  const orders = ordersData?.success ? ordersData.data?.items || [] : [];

  const handleFiltersChange = (newFilters: GetOrdersDto) => {
    setFilters(newFilters);
    setSelectedOrders([]); // Clear selection when filters change
  };

  const handleSelectionChange = (orderIds: string[]) => {
    setSelectedOrders(orderIds);
  };

  const handleOrdersUpdated = () => {
    refetch();
    setSelectedOrders([]);
  };

  const handleExport = (data: any) => {
    console.log("Exporting orders:", data);
  };

  // Quick stats based on current orders
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) =>
      ["PENDING", "DESIGN_PENDING", "PAYMENT_PENDING"].includes(o.status)
    ).length,
    processing: orders.filter((o) =>
      ["PROCESSING", "PRODUCTION"].includes(o.status)
    ).length,
    urgent: orders.filter((o) =>
      ["RUSH", "EMERGENCY"].includes(o.urgencyLevel || "")
    ).length,
    overdue: orders.filter((o) => {
      if (!o.expectedDelivery) return false;
      return (
        new Date(o.expectedDelivery) < new Date() &&
        !["DELIVERED", "CANCELLED"].includes(o.status)
      );
    }).length,
  };

  const quickFilters = [
    {
      label: "All Orders",
      count: orderStats.total,
      filters: { page: 1, limit: 20 },
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Pending",
      count: orderStats.pending,
      filters: { status: "PENDING" as const, page: 1, limit: 20 },
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "Processing",
      count: orderStats.processing,
      filters: { status: "PROCESSING" as const, page: 1, limit: 20 },
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "Urgent",
      count: orderStats.urgent,
      filters: { urgencyLevel: "RUSH" as const, page: 1, limit: 20 },
      color: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Manage all customer orders, track progress, and perform bulk
            operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>

          <Button asChild>
            <Link href="/dashboard/admin/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickFilters.map((filter, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFiltersChange(filter.filters)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {filter.label}
                  </p>
                  <p className="text-2xl font-bold">{filter.count}</p>
                </div>
                <Badge className={filter.color}>{filter.count}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts for urgent items */}
      {orderStats.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{orderStats.overdue} orders are overdue</strong> - These
            need immediate attention
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-red-800 p-0 h-auto"
              onClick={() =>
                handleFiltersChange({
                  page: 1,
                  limit: 20,
                  // Add filter for overdue orders in real implementation
                })
              }
            >
              View overdue orders
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {orderStats.urgent > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{orderStats.urgent} urgent orders</strong> require priority
            handling
            <Button
              variant="link"
              size="sm"
              className="ml-2 text-orange-800 p-0 h-auto"
              onClick={() =>
                handleFiltersChange({
                  urgencyLevel: "RUSH",
                  page: 1,
                  limit: 20,
                })
              }
            >
              View urgent orders
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="all-orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-orders">All Orders</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
          <TabsTrigger value="approval-queue">Approval Queue</TabsTrigger>
          <TabsTrigger value="export">Export & Reports</TabsTrigger>
        </TabsList>

        {/* All Orders Tab */}
        <TabsContent value="all-orders" className="space-y-6">
          {/* Advanced Search */}
          <AdvancedOrderSearch
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {/* Orders List */}
          <OrdersList
            filters={filters}
            onFiltersChange={handleFiltersChange}
            selectable={true}
            selectedOrders={selectedOrders}
            onSelectionChange={handleSelectionChange}
            showActions={true}
            compact={false}
          />

          {/* Selection Summary */}
          {selectedOrders.length > 0 && (
            <Card className="border-primary">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {selectedOrders.length} order
                      {selectedOrders.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Export Selected
                    </Button>
                    <Button size="sm">Bulk Actions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bulk Actions Tab */}
        <TabsContent value="bulk-actions">
          <BulkOperations
            orders={orders}
            selectedOrders={selectedOrders}
            onSelectionChange={handleSelectionChange}
            onOrdersUpdated={handleOrdersUpdated}
          />
        </TabsContent>

        {/* Approval Queue Tab */}
        <TabsContent value="approval-queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Design Approval Queue
              </CardTitle>
              <CardDescription>
                Orders waiting for customer design approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersList
                filters={{
                  status: "DESIGN_PENDING",
                  page: 1,
                  limit: 20,
                }}
                selectable={false}
                showActions={true}
                compact={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Queue Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter((o) => o.status === "DESIGN_PENDING").length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pending Approval
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      orders.filter((o) => o.status === "DESIGN_APPROVED")
                        .length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recently Approved
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      orders.filter((o) => o.status === "DESIGN_REJECTED")
                        .length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rejected/Revision
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Reports Tab */}
        <TabsContent value="export">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Orders</CardTitle>
                <CardDescription>
                  Download order data in various formats for reporting and
                  analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderExport
                  orders={orders}
                  filters={filters}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>
                  Pre-configured reports for common use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Daily Operations Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Weekly Performance Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Monthly Financial Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Customer Order History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

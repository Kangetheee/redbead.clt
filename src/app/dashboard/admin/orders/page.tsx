/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import AdminOrderTable from "./order-table";

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Valid enum values
  const ORDER_STATUS = [
    "PENDING",
    "DESIGN_PENDING",
    "DESIGN_APPROVED",
    "DESIGN_REJECTED",
    "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED",
    "PROCESSING",
    "PRODUCTION",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ] as const;

  const DESIGN_APPROVAL_STATUS = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
  ] as const;

  const URGENCY_LEVELS = ["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"] as const;

  // Type guards
  const isValidOrderStatus = (
    status: string
  ): status is (typeof ORDER_STATUS)[number] => {
    return ORDER_STATUS.includes(status as any);
  };

  const isValidDesignApprovalStatus = (
    status: string
  ): status is (typeof DESIGN_APPROVAL_STATUS)[number] => {
    return DESIGN_APPROVAL_STATUS.includes(status as any);
  };

  const isValidUrgencyLevel = (
    level: string
  ): level is (typeof URGENCY_LEVELS)[number] => {
    return URGENCY_LEVELS.includes(level as any);
  };

  // Extract current filters from URL with type validation
  const statusParam = searchParams.get("status");
  const designApprovalStatusParam = searchParams.get("designApprovalStatus");
  const urgencyLevelParam = searchParams.get("urgencyLevel");

  const currentFilters: GetOrdersDto = {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
    status:
      statusParam && isValidOrderStatus(statusParam) ? statusParam : undefined,
    search: searchParams.get("search") || undefined,
    designApprovalStatus:
      designApprovalStatusParam &&
      isValidDesignApprovalStatus(designApprovalStatusParam)
        ? designApprovalStatusParam
        : undefined,
    urgencyLevel:
      urgencyLevelParam && isValidUrgencyLevel(urgencyLevelParam)
        ? urgencyLevelParam
        : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    minTotal: searchParams.get("minTotal")
      ? parseFloat(searchParams.get("minTotal")!)
      : undefined,
    maxTotal: searchParams.get("maxTotal")
      ? parseFloat(searchParams.get("maxTotal")!)
      : undefined,
  };

  // Handle filter changes by updating URL
  const handleFiltersChange = (newFilters: GetOrdersDto) => {
    const params = new URLSearchParams();

    // Add all non-undefined values to params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString());
      }
    });

    // Navigate to new URL with updated params
    const queryString = params.toString();
    router.push(
      `/dashboard/admin/orders${queryString ? `?${queryString}` : ""}`
    );
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/admin/orders/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      <AdminOrderTable
        filters={currentFilters}
        onFiltersChange={handleFiltersChange}
        showFilters={true}
        compact={false}
        pageSize={currentFilters.limit || 10}
      />
    </div>
  );
}

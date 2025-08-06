/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OrdersList from "@/components/orders/orders-list";
import OrderExport from "@/components/orders/order-export";
import BulkOperations from "@/components/orders/bulk-operations";

import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";
import { OrderResponse } from "@/lib/orders/types/orders.types";

export default function OrdersClient() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filters, setFilters] = useState<GetOrdersDto>({ page: 1, limit: 20 });

  const handleOrdersUpdated = () => {
    window.location.reload();
  };

  const handleExport = (data: any) => {
    console.log("Exported data:", data);
  };

  const handleFiltersChange = (newFilters: GetOrdersDto) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <OrderExport
            orders={orders}
            filters={filters}
            onExport={handleExport}
          />
          <Button asChild>
            <Link href="/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedOrders.length > 0 && (
        <BulkOperations
          orders={orders}
          selectedOrders={selectedOrders}
          onSelectionChange={setSelectedOrders}
          onOrdersUpdated={handleOrdersUpdated}
        />
      )}

      {/* Orders Table */}
      <OrdersList
        filters={filters}
        onFiltersChange={handleFiltersChange}
        selectable={true}
        selectedOrders={selectedOrders}
        onSelectionChange={setSelectedOrders}
        showActions={true}
        compact={false}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ...Your Cards */}
      </div>
    </div>
  );
}

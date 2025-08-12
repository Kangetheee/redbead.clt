/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrdersList from "@/components/orders/orders-list";
import { OrderFilters } from "@/lib/orders/types/orders.types";

// Remove the incorrect interface - OrdersClient doesn't need userPhone
export default function OrdersClient() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({});

  const handleExport = (data: any) => {
    // TODO: export client Order
    console.log("Exported data:", data);
  };

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersList
        filters={filters}
        onFiltersChange={handleFiltersChange}
        selectable={true}
        selectedOrders={selectedOrders}
        onSelectionChange={setSelectedOrders}
        compact={false}
      />
    </div>
  );
}

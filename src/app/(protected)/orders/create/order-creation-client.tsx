/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OrdersList from "@/components/orders/orders-list";
import { OrderFilters } from "@/lib/orders/types/orders.types";
import OrderTypeModal from "./order-type-modal";
import CreateOrderForm from "@/components/orders/create-order-form";
import QuickOrderForm from "@/components/orders/quick-order-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// interface OrdersClientProps {
//   userPhone?: string;
// }

export default function OrdersClient() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<
    "full" | "quick" | null
  >(null);

  const handleExport = (data: any) => {
    // TODO: export client Order
    console.log("Exported data:", data);
  };

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const handleCreateOrderClick = () => {
    setShowOrderTypeModal(true);
  };

  const handleOrderTypeSelect = (type: "full" | "quick") => {
    setSelectedOrderType(type);
    setShowOrderTypeModal(false);
    setShowCreateModal(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setShowCreateModal(false);
    setSelectedOrderType(null);
    // You can add navigation to the order detail page or show a success message
    console.log(`Order ${orderId} created successfully`);
  };

  const handleOrderCancel = () => {
    setShowCreateModal(false);
    setSelectedOrderType(null);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowOrderTypeModal(false);
    setSelectedOrderType(null);
  };

  const handleChangeOrderType = () => {
    setShowCreateModal(false);
    setShowOrderTypeModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all customer orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleCreateOrderClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
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

      {/* Order Type Selection Modal */}
      <OrderTypeModal
        isOpen={showOrderTypeModal}
        onClose={() => setShowOrderTypeModal(false)}
        onSelectType={handleOrderTypeSelect}
      />

      {/* Create Order Form Modal */}
      <Dialog open={showCreateModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Create {selectedOrderType === "quick" ? "Quick" : "Full"} Order
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Show selected order form */}
            {selectedOrderType === "quick" ? (
              <QuickOrderForm
                onSuccess={handleOrderSuccess}
                onCancel={handleOrderCancel}
                defaultShippingAddressId="default-address-id"
                // userPhone={userPhone}
              />
            ) : (
              <CreateOrderForm
                onSuccess={handleOrderSuccess}
                onCancel={handleOrderCancel}
              />
            )}

            {/* Button to change order type */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Want to switch to a different order type?
                  </p>
                  <button
                    onClick={handleChangeOrderType}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Change Order Type
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">
                      Need Help?
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      If you&apos;re unsure about any requirements or need
                      assistance with your order, our team is here to help.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Contact Support
                      </Button>
                      <Button variant="outline" size="sm">
                        View Guide
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

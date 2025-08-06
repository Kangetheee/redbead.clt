"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateOrderForm from "@/components/orders/create-order-form";
import QuickOrderForm from "@/components/orders/quick-order-form";

interface OrderCreationClientProps {
  userPhone: string;
}

export default function OrderCreationClient({
  userPhone,
}: OrderCreationClientProps) {
  const router = useRouter();
  const [orderType, setOrderType] = React.useState<"full" | "quick">("quick");

  const handleOrderSuccess = (orderId: string) => {
    // Redirect to order details page
    router.push(`/orders/${orderId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      {/* Order Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Order Type</CardTitle>
          <CardDescription>
            Select the type of order you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                orderType === "quick"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setOrderType("quick")}
            >
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Quick Order</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Simple order creation with basic requirements
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      Fast
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Simple
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                orderType === "full"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setOrderType("full")}
            >
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Full Order Form</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete order form with detailed specifications
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      Detailed
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Comprehensive
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Advanced
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      {orderType === "quick" ? (
        <QuickOrderForm
          onSuccess={handleOrderSuccess}
          onCancel={handleCancel}
          defaultShippingAddressId="default-address-id"
          userPhone={userPhone}
        />
      ) : (
        <CreateOrderForm
          onSuccess={handleOrderSuccess}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

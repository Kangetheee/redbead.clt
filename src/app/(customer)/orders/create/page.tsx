/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { getSession } from "@/lib/session/session";
import { ArrowLeft, Zap, Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderCreationClient from "./order-creation-client";

export default async function CreateOrdersPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
            <p className="text-muted-foreground">
              Create a new order for your customer
            </p>
          </div>
        </div>
      </div>

      {/* Order Type Selection and Forms - Client Component */}
      <OrderCreationClient userPhone={session?.user?.phone || ""} />

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                If you&apos;re unsure about any requirements or need assistance
                with your order, our team is here to help.
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
  );
}

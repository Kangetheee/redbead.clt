// app/dashboard/admin/orders/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Package,
  User,
  Clock,
  MessageSquare,
  Settings,
  Download,
  Mail,
  Phone,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import our order components
import OrderDetailView from "@/components/orders/order-detail-view";
import OrderTimeline from "@/components/orders/order-timeline";
import OrderStatusUpdate from "@/components/orders/order-status-update";
import NotesList from "@/components/orders/order-notes/notes-list";
import { AddNoteDialog } from "@/components/orders/order-notes/add-note-dialog";
import { useOrder } from "@/hooks/use-orders";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch order data
  const { data: orderData, isLoading, refetch } = useOrder(orderId);
  const order = orderData?.success ? orderData.data : null;

  const handleStatusUpdated = () => {
    refetch();
  };

  const handleNoteAdded = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Order not found or you don&apos;t have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isUrgent =
    order.urgencyLevel && ["RUSH", "EMERGENCY"].includes(order.urgencyLevel);
  const needsAttention =
    order.status === "DESIGN_PENDING" ||
    (order.expectedDelivery && new Date(order.expectedDelivery) < new Date());

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">Admin View</Badge>
              {isUrgent && (
                <Badge variant="destructive">{order.urgencyLevel}</Badge>
              )}
              {needsAttention && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Attention
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Email Customer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Order Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild>
            <Link href={`/dashboard/admin/orders/${order.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert Banner for urgent items */}
      {isUrgent && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgent Order:</strong> This{" "}
            {order.urgencyLevel?.toLowerCase()} order requires immediate
            attention and priority processing.
          </AlertDescription>
        </Alert>
      )}

      {order.designApprovalRequired &&
        order.designApproval?.status === "PENDING" && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Design Approval Pending:</strong> Customer review required
              for design mockups.
              <Button
                variant="link"
                size="sm"
                className="ml-2 text-yellow-800 p-0 h-auto"
              >
                Send Reminder
              </Button>
            </AlertDescription>
          </Alert>
        )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <OrderDetailView orderId={orderId} />
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items ({order.orderItems.length})
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of products and specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                Product {item.productId}
                              </h4>
                              <Badge variant="outline">
                                Qty: {item.quantity}
                              </Badge>
                            </div>

                            {item.customizations &&
                              Object.keys(item.customizations).length > 0 && (
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">
                                    CUSTOMIZATIONS
                                  </label>
                                  <div className="mt-1 p-2 bg-muted rounded text-sm">
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {JSON.stringify(
                                        item.customizations,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Item {index + 1}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              Edit Item
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <OrderTimeline
                order={order}
                showFilters={true}
                maxHeight="700px"
              />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <NotesList
                orderId={orderId}
                showAddButton={true}
                maxHeight="600px"
                showFilters={true}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Settings</CardTitle>
                    <CardDescription>
                      Manage order-specific configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Design Approval Required</span>
                      <Badge
                        variant={
                          order.designApprovalRequired ? "default" : "secondary"
                        }
                      >
                        {order.designApprovalRequired ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Urgency Level</span>
                      <Badge variant="outline">
                        {order.urgencyLevel || "NORMAL"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expected Production Days</span>
                      <span className="text-sm font-medium">
                        {order.expectedProductionDays || "Not set"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Admin Tools</CardTitle>
                    <CardDescription>
                      Administrative actions for this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Customer Notification
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Create Production Ticket
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Status & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Update */}
          <OrderStatusUpdate
            order={order}
            onStatusUpdated={handleStatusUpdated}
          />

          {/* Quick Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AddNoteDialog
                orderId={orderId}
                onNoteAdded={handleNoteAdded}
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                }
              />

              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Customer
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Files
              </Button>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  CUSTOMER ID
                </label>
                <p className="font-medium">{order.customerId}</p>
              </div>

              {/* Add more customer fields as available */}

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Customer Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Created</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Payment</span>
                  {order.payment ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Production</span>
                  {[
                    "PROCESSING",
                    "PRODUCTION",
                    "SHIPPED",
                    "DELIVERED",
                  ].includes(order.status) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Shipped</span>
                  {["SHIPPED", "DELIVERED"].includes(order.status) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Delivered</span>
                  {order.status === "DELIVERED" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

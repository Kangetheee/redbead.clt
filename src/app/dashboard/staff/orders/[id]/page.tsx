/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Package,
  Clock,
  FileText,
  Printer,
  Truck,
  MessageSquare,
  Settings,
  Timer,
  User,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  Camera,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import our order components
import OrderStatusUpdate from "@/components/orders/order-status-update";
import OrderTimeline from "@/components/orders/order-timeline";
import { AddNoteDialog } from "@/components/orders/order-notes/add-note-dialog";
import { useOrder } from "@/hooks/use-orders";

export default function StaffOrderProcessingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("production");

  // Fetch order data
  const { data: orderData, isLoading, refetch } = useOrder(orderId);
  const order = orderData?.success ? orderData.data : null;

  const handleStartProcessing = () => {
    setIsProcessing(true);
    // Implement actual processing logic
  };

  const handlePauseProcessing = () => {
    setIsProcessing(false);
    // Implement pause logic
  };

  const handleCompleteStep = () => {
    // Implement step completion
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
  const canProcess = [
    "PENDING",
    "DESIGN_APPROVED",
    "PAYMENT_CONFIRMED",
  ].includes(order.status);

  // Mock production steps
  const productionSteps = [
    {
      id: "design",
      title: "Design Preparation",
      description: "Review and prepare design files for production",
      status: "completed",
      duration: "15 min",
      assignee: "Design Team",
    },
    {
      id: "materials",
      title: "Material Preparation",
      description: "Source and prepare materials for printing",
      status: isProcessing ? "in-progress" : "pending",
      duration: "30 min",
      assignee: "Production Team",
    },
    {
      id: "printing",
      title: "Printing Process",
      description: "Execute the printing/production process",
      status: "pending",
      duration: "2 hours",
      assignee: "Print Operator",
    },
    {
      id: "quality",
      title: "Quality Check",
      description: "Inspect and verify product quality",
      status: "pending",
      duration: "15 min",
      assignee: "QC Team",
    },
    {
      id: "packaging",
      title: "Packaging & Shipping",
      description: "Package and prepare for shipment",
      status: "pending",
      duration: "20 min",
      assignee: "Shipping Team",
    },
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Timer;
      default:
        return Clock;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in-progress":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/staff/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">Production View</Badge>
              {isUrgent && (
                <Badge variant="destructive">{order.urgencyLevel}</Badge>
              )}
              {isProcessing && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Timer className="h-3 w-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canProcess && !isProcessing && (
            <Button onClick={handleStartProcessing}>
              <Play className="h-4 w-4 mr-2" />
              Start Processing
            </Button>
          )}

          {isProcessing && (
            <Button variant="outline" onClick={handlePauseProcessing}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Urgent Order Alert */}
      {isUrgent && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Urgent Order:</strong> This{" "}
            {order.urgencyLevel?.toLowerCase()} order requires priority
            processing. Expected completion:{" "}
            {order.expectedDelivery
              ? format(
                  new Date(order.expectedDelivery),
                  "MMM dd, yyyy 'at' hh:mm a"
                )
              : "ASAP"}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Production Tab */}
            <TabsContent value="production" className="space-y-6">
              {/* Production Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Production Progress
                  </CardTitle>
                  <CardDescription>
                    Track the production workflow for this order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productionSteps.map((step, index) => {
                      const Icon = getStepIcon(step.status);
                      const color = getStepColor(step.status);

                      return (
                        <div key={step.id} className="relative">
                          {index < productionSteps.length - 1 && (
                            <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                          )}

                          <div className="flex items-start gap-4">
                            <div
                              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-card`}
                            >
                              <Icon className={`h-5 w-5 ${color}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {step.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>Duration: {step.duration}</span>
                                    <span>Assignee: {step.assignee}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {step.status === "in-progress" && (
                                    <Button
                                      size="sm"
                                      onClick={handleCompleteStep}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Complete
                                    </Button>
                                  )}

                                  {step.status === "pending" && index === 1 && (
                                    <Button size="sm" variant="outline">
                                      <Play className="h-4 w-4 mr-2" />
                                      Start
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Production Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Production Tools</CardTitle>
                  <CardDescription>
                    Quick access to production utilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Button variant="outline" className="justify-start">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Queue
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Camera className="h-4 w-4 mr-2" />
                      Quality Photos
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Design Files
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Work Instructions
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Truck className="h-4 w-4 mr-2" />
                      Ship Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications">
              <Card>
                <CardHeader>
                  <CardTitle>Order Specifications</CardTitle>
                  <CardDescription>
                    Detailed specifications and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.orderItems.map((item, index) => (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">
                                Product {item.productId}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>

                              {item.customizations &&
                                Object.keys(item.customizations).length > 0 && (
                                  <div className="mt-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      CUSTOMIZATIONS
                                    </Label>
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
                            <Badge variant="outline">Item {index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div>
                      <h4 className="font-medium mb-2">Special Instructions</h4>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{order.specialInstructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Production Requirements */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Production Requirements
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          URGENCY LEVEL
                        </Label>
                        <p className="font-medium">
                          {order.urgencyLevel || "NORMAL"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          EXPECTED PRODUCTION DAYS
                        </Label>
                        <p className="font-medium">
                          {order.expectedProductionDays || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          DESIGN APPROVAL REQUIRED
                        </Label>
                        <p className="font-medium">
                          {order.designApprovalRequired ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          EXPECTED DELIVERY
                        </Label>
                        <p className="font-medium">
                          {order.expectedDelivery
                            ? format(
                                new Date(order.expectedDelivery),
                                "MMM dd, yyyy"
                              )
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <OrderTimeline
                order={order}
                showFilters={true}
                maxHeight="600px"
              />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Production Notes</CardTitle>
                      <CardDescription>
                        Add notes about the production process
                      </CardDescription>
                    </div>
                    <AddNoteDialog
                      orderId={orderId}
                      onNoteAdded={() => refetch()}
                      trigger={
                        <Button>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>ST</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          Staff Member
                        </span>
                        <Badge variant="outline" className="text-xs">
                          PRODUCTION
                        </Badge>
                      </div>
                      <p className="text-sm">
                        Started material preparation. All required materials are
                        in stock.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        2 hours ago
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>QC</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          Quality Control
                        </span>
                        <Badge variant="outline" className="text-xs">
                          QUALITY
                        </Badge>
                      </div>
                      <p className="text-sm">
                        Design files reviewed and approved for production.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        4 hours ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Status */}
          <OrderStatusUpdate order={order} onStatusUpdated={() => refetch()} />

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  CUSTOMER ID
                </Label>
                <p className="font-medium">{order.customerId}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Customer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Instructions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Progress Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Truck className="h-4 w-4 mr-2" />
                Ship Order
              </Button>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {isProcessing ? "02:15" : "00:00"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isProcessing ? "Time spent" : "Not started"}
                </p>
              </div>

              {isProcessing ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handlePauseProcessing}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Timer
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleStartProcessing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

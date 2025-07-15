/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  FileText,
  Truck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Mail,
  Phone,
  Copy,
  Edit,
  MoreHorizontal,
  Star,
  Flag,
  MessageSquare,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Settings,
  Shield,
  Zap,
  RefreshCw,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import OrderStatusUpdate from "@/components/orders/order-status-update";
import OrderTimeline from "@/components/orders/order-timeline";
import { AddNoteDialog } from "@/components/orders/order-notes/add-note-dialog";
import NotesList from "@/components/orders/order-notes/notes-list";

interface AdminOrderDetailsProps {
  order: OrderResponse;
  onOrderUpdated?: () => void;
}

export default function AdminOrderDetails({
  order,
  onOrderUpdated,
}: AdminOrderDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [orderPriority, setOrderPriority] = useState(
    order.urgencyLevel || "NORMAL"
  );

  const handleStatusUpdated = () => {
    onOrderUpdated?.();
  };

  const handleNoteAdded = () => {
    onOrderUpdated?.();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusProgress = () => {
    const statusFlow = [
      "PENDING",
      "DESIGN_PENDING",
      "DESIGN_APPROVED",
      "PAYMENT_CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];

    const currentIndex = statusFlow.indexOf(order.status);
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusFlow.length) * 100
      : 0;
  };

  const getUrgencyColor = (urgencyLevel?: string) => {
    switch (urgencyLevel) {
      case "EMERGENCY":
        return "text-red-600 bg-red-50 border-red-200";
      case "RUSH":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "EXPEDITED":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskLevel = () => {
    const isOverdue =
      order.expectedDelivery && new Date(order.expectedDelivery) < new Date();
    const isHighValue = order.totalAmount > 1000;
    const isUrgent = ["RUSH", "EMERGENCY"].includes(order.urgencyLevel || "");
    const needsApproval = order.status === "DESIGN_PENDING";

    if (isOverdue || (isUrgent && needsApproval)) return "HIGH";
    if (isHighValue || isUrgent) return "MEDIUM";
    return "LOW";
  };

  const riskLevel = getRiskLevel();
  const riskColors = {
    HIGH: "text-red-600 bg-red-50",
    MEDIUM: "text-orange-600 bg-orange-50",
    LOW: "text-green-600 bg-green-50",
  };

  // Mock customer data - in real app this would come from customer service
  const customerData = {
    id: order.customerId,
    name: `Customer ${order.customerId}`,
    email: "customer@example.com",
    phone: "+254-xxx-xxx-xxx",
    type: "BUSINESS",
    since: "2023-06-15",
    totalOrders: 23,
    totalSpent: 15670.5,
    averageOrderValue: 681.76,
    lastOrderDate: "2024-01-10",
    paymentMethod: "M-PESA",
    creditLimit: 5000,
    accountManager: "John Doe",
  };

  const orderMetrics = {
    profitMargin: 35.2,
    productionCost: order.totalAmount * 0.65,
    estimatedProfit: order.totalAmount * 0.35,
    timeToComplete: order.expectedProductionDays || 5,
    complexity: "MEDIUM", // Based on order items and customizations
    resourcesRequired: ["Design Team", "Print Operator", "QC"],
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} size="default" />
            {order.urgencyLevel && order.urgencyLevel !== "NORMAL" && (
              <Badge className={getUrgencyColor(order.urgencyLevel)}>
                <Zap className="h-3 w-3 mr-1" />
                {order.urgencyLevel}
              </Badge>
            )}
            <Badge className={riskColors[riskLevel]}>
              <Shield className="h-3 w-3 mr-1" />
              {riskLevel} Risk
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Created{" "}
              {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
            </span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>•</span>
            <span>
              Last updated{" "}
              {formatDistanceToNow(new Date(order.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Order Progress</span>
              <span>{Math.round(getStatusProgress())}% Complete</span>
            </div>
            <Progress value={getStatusProgress()} className="w-96" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => copyToClipboard(order.orderNumber)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Order Number
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Email Customer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Flag for Review
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/orders/${order.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {order.urgencyLevel === "EMERGENCY" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency Order:</strong> This order requires immediate
            attention and priority processing.
          </AlertDescription>
        </Alert>
      )}

      {order.status === "DESIGN_PENDING" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Design Approval Pending:</strong> Customer review required.
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Financial Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      SUBTOTAL
                    </Label>
                    <p className="font-medium">
                      ${order.subtotalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      TAX
                    </Label>
                    <p className="font-medium">${order.taxAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      SHIPPING
                    </Label>
                    <p className="font-medium">
                      ${order.shippingAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      TOTAL
                    </Label>
                    <p className="text-lg font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.discountAmount > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Discount Applied
                      </span>
                      <span className="font-medium text-green-600">
                        -${order.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                <Separator />

                {/* Business Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      PROFIT MARGIN
                    </Label>
                    <p className="text-lg font-bold text-green-600">
                      {orderMetrics.profitMargin}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${orderMetrics.estimatedProfit.toFixed(2)} profit
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      PRODUCTION COST
                    </Label>
                    <p className="text-lg font-bold">
                      ${orderMetrics.productionCost.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Material + Labor
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      COMPLEXITY
                    </Label>
                    <p className="text-lg font-bold">
                      {orderMetrics.complexity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {orderMetrics.timeToComplete} days est.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <OrderStatusUpdate
                  order={order}
                  onStatusUpdated={handleStatusUpdated}
                />

                <Separator />

                <div className="space-y-2">
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
                  <AddNoteDialog
                    orderId={order.id}
                    onNoteAdded={handleNoteAdded}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    SHIPPING ADDRESS
                  </Label>
                  <p className="mt-1">Address ID: {order.shippingAddress.id}</p>
                  {/* In real app, display full address details */}
                </div>

                {order.trackingNumber && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      TRACKING
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium font-mono">
                        {order.trackingNumber}
                      </p>
                      {order.trackingUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {order.expectedDelivery && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      EXPECTED DELIVERY
                    </Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(order.expectedDelivery),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.payment ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          METHOD
                        </Label>
                        <p className="font-medium">{order.payment.method}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          STATUS
                        </Label>
                        <Badge variant="outline">{order.payment.status}</Badge>
                      </div>
                    </div>

                    {order.payment.transactionId && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          TRANSACTION ID
                        </Label>
                        <p className="font-medium font-mono text-sm">
                          {order.payment.transactionId}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        AMOUNT
                      </Label>
                      <p className="text-lg font-bold">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500" />
                    <p className="mt-2 font-medium">Payment Pending</p>
                    <p className="text-sm text-muted-foreground">
                      Customer has not completed payment
                    </p>
                    <Button size="sm" className="mt-2">
                      Send Payment Reminder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Design Approval Section */}
          {order.designApprovalRequired && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Design Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.designApproval ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant="outline">
                        {order.designApproval.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          REQUESTED
                        </Label>
                        <p className="text-sm">
                          {format(
                            new Date(order.designApproval.requestedAt),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>

                      {order.designApproval.respondedAt && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            RESPONDED
                          </Label>
                          <p className="text-sm">
                            {format(
                              new Date(order.designApproval.respondedAt),
                              "MMM dd, yyyy"
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {order.designApproval.rejectionReason && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          REJECTION REASON
                        </Label>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">
                          {order.designApproval.rejectionReason}
                        </p>
                      </div>
                    )}

                    {order.designApproval.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm">Send Reminder</Button>
                        <Button size="sm" variant="outline">
                          Override Approval
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="mx-auto h-8 w-8 text-blue-500" />
                    <p className="mt-2 font-medium">
                      Design approval not yet requested
                    </p>
                    <Button size="sm" className="mt-2">
                      Request Design Approval
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customer Tab */}
        <TabsContent value="customer" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {customerData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{customerData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {customerData.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customerData.phone}
                    </p>
                    <Badge variant="outline">
                      {customerData.type} Customer
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      CUSTOMER SINCE
                    </Label>
                    <p className="font-medium">
                      {format(new Date(customerData.since), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      ACCOUNT MANAGER
                    </Label>
                    <p className="font-medium">{customerData.accountManager}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      PAYMENT METHOD
                    </Label>
                    <p className="font-medium">{customerData.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      CREDIT LIMIT
                    </Label>
                    <p className="font-medium">
                      ${customerData.creditLimit.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      TOTAL ORDERS
                    </Label>
                    <p className="text-2xl font-bold">
                      {customerData.totalOrders}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      TOTAL SPENT
                    </Label>
                    <p className="text-2xl font-bold">
                      ${customerData.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      AVG ORDER VALUE
                    </Label>
                    <p className="text-lg font-bold">
                      ${customerData.averageOrderValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      LAST ORDER
                    </Label>
                    <p className="text-sm">
                      {format(new Date(customerData.lastOrderDate), "MMM dd")}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Loyalty Score</span>
                    <span className="font-medium">85/100</span>
                  </div>
                  <Progress value={85} />
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">VIP Customer</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Order History</CardTitle>
              <CardDescription>
                Last 5 orders from this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock recent orders */}
                {[
                  {
                    orderNumber: "ORD-12344",
                    date: "2024-01-10",
                    amount: 450.0,
                    status: "DELIVERED",
                  },
                  {
                    orderNumber: "ORD-12320",
                    date: "2023-12-15",
                    amount: 280.5,
                    status: "DELIVERED",
                  },
                  {
                    orderNumber: "ORD-12301",
                    date: "2023-11-22",
                    amount: 675.25,
                    status: "DELIVERED",
                  },
                  {
                    orderNumber: "ORD-12285",
                    date: "2023-10-30",
                    amount: 320.0,
                    status: "DELIVERED",
                  },
                  {
                    orderNumber: "ORD-12270",
                    date: "2023-10-05",
                    amount: 890.75,
                    status: "DELIVERED",
                  },
                ].map((prevOrder, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{prevOrder.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(prevOrder.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${prevOrder.amount.toFixed(2)}
                      </p>
                      <OrderStatusBadge status={prevOrder.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <div className="space-y-6">
                {order.orderItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-medium">
                            Product {item.productId}
                          </h4>
                          <Badge variant="outline">Item {index + 1}</Badge>
                          <Badge variant="secondary">
                            Qty: {item.quantity}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">
                              QUANTITY
                            </Label>
                            <p className="font-medium">{item.quantity} units</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">
                              UNIT COST
                            </Label>
                            <p className="font-medium">
                              $
                              {(
                                order.totalAmount /
                                order.orderItems.reduce(
                                  (sum, i) => sum + i.quantity,
                                  0
                                )
                              ).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">
                              TOTAL VALUE
                            </Label>
                            <p className="font-medium">
                              $
                              {(
                                order.totalAmount / order.orderItems.length
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {item.customizations &&
                      Object.keys(item.customizations).length > 0 && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">
                            CUSTOMIZATIONS
                          </Label>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(item.customizations, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                    {/* Production Requirements */}
                    <Separator className="my-4" />
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        PRODUCTION REQUIREMENTS
                      </Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Materials
                          </Label>
                          <p>Premium Paper, Ink</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Machine
                          </Label>
                          <p>Digital Press A1</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Time Required
                          </Label>
                          <p>2.5 hours</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Complexity
                          </Label>
                          <p>Medium</p>
                        </div>
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
          <OrderTimeline order={order} showFilters={true} maxHeight="700px" />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <NotesList
            orderId={order.id}
            showAddButton={true}
            maxHeight="600px"
            showFilters={true}
          />
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Order Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Order Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="priority">Priority Level</Label>
                    <div className="flex items-center gap-2">
                      {isEditingPriority ? (
                        <>
                          <Select
                            value={orderPriority}
                            onValueChange={setOrderPriority}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NORMAL">Normal</SelectItem>
                              <SelectItem value="EXPEDITED">
                                Expedited
                              </SelectItem>
                              <SelectItem value="RUSH">Rush</SelectItem>
                              <SelectItem value="EMERGENCY">
                                Emergency
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => setIsEditingPriority(false)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge
                            className={getUrgencyColor(order.urgencyLevel)}
                          >
                            {order.urgencyLevel || "NORMAL"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingPriority(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Design Approval Required</Label>
                    <Badge
                      variant={
                        order.designApprovalRequired ? "default" : "secondary"
                      }
                    >
                      {order.designApprovalRequired ? "Yes" : "No"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Expected Production Days</Label>
                    <span className="font-medium">
                      {order.expectedProductionDays || "Not set"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Admin Actions</Label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Flag className="h-4 w-4 mr-2" />
                      Flag for Review
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Escalate to Manager
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Override Approval
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Workflow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Admin Notes</CardTitle>
                <CardDescription>
                  Notes visible only to admin users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes..."
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        Save Notes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-3 bg-muted rounded-lg min-h-[100px]">
                      {adminNotes || (
                        <span className="text-muted-foreground">
                          No internal notes yet
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsEditingNotes(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Notes
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    System Information
                  </Label>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Order ID: {order.id}</p>
                    <p>
                      Created:{" "}
                      {format(
                        new Date(order.createdAt),
                        "MMM dd, yyyy 'at' HH:mm:ss"
                      )}
                    </p>
                    <p>
                      Updated:{" "}
                      {format(
                        new Date(order.updatedAt),
                        "MMM dd, yyyy 'at' HH:mm:ss"
                      )}
                    </p>
                    <p>Source: Web Dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Order Analytics</CardTitle>
              <CardDescription>
                Business intelligence for this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {orderMetrics.profitMargin}%
                  </div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${orderMetrics.estimatedProfit.toFixed(0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Est. Profit</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {orderMetrics.timeToComplete}d
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Production Time
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {riskLevel}
                  </div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

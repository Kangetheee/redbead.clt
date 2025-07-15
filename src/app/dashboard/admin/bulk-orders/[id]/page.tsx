/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  User,
  Calendar,
  FileText,
  Calculator,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  Share,
  Copy,
  Printer,
  MoreHorizontal,
  Plus,
  Zap,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock bulk order data - replace with actual API
interface BulkOrderItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, any>;
}

interface BulkOrder {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  items: BulkOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status:
    | "DRAFT"
    | "QUOTED"
    | "APPROVED"
    | "REJECTED"
    | "CONVERTED"
    | "EXPIRED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  quotedAt?: string;
  expiresAt: string;
  approvedAt?: string;
  convertedOrders?: string[];
  notes: string;
  terms: string;
  validityPeriod: number; // days
  paymentTerms: string;
  deliveryTerms: string;
  estimatedDelivery?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminBulkOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [isApproving, setIsApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [conversionDialog, setConversionDialog] = useState(false);

  // Mock data - replace with actual API call
  const bulkOrder: BulkOrder = {
    id: orderId,
    quoteNumber: "BQ-2024-001",
    customerName: "Tech Solutions Ltd",
    customerId: "CUST-001",
    customerEmail: "procurement@techsolutions.com",
    customerPhone: "+254 700 123 456",
    description:
      "Corporate event materials package including branded merchandise and promotional items",
    items: [
      {
        id: "1",
        productName: "Custom T-Shirts",
        description: "100% cotton branded t-shirts with company logo",
        quantity: 500,
        unitPrice: 12.5,
        totalPrice: 6250.0,
        specifications: {
          material: "100% Cotton",
          colors: ["Navy Blue", "White"],
          sizes: "S, M, L, XL, XXL",
          printing: "Screen printing, 2-color logo",
        },
      },
      {
        id: "2",
        productName: "Business Cards",
        description: "Premium business cards for all employees",
        quantity: 2000,
        unitPrice: 0.75,
        totalPrice: 1500.0,
        specifications: {
          cardStock: "350gsm Matt Laminated",
          size: "90mm x 50mm",
          printing: "Full color both sides",
          finishing: "Matt lamination",
        },
      },
      {
        id: "3",
        productName: "Promotional Banners",
        description: "Event banners for trade shows and conferences",
        quantity: 10,
        unitPrice: 85.0,
        totalPrice: 850.0,
        specifications: {
          material: "PVC Banner 500gsm",
          size: "3m x 2m",
          printing: "Full color digital print",
          finishing: "Hemmed edges with eyelets",
        },
      },
    ],
    subtotal: 8600.0,
    taxAmount: 1376.0,
    discountAmount: 500.0,
    totalAmount: 9476.0,
    status: "QUOTED",
    priority: "HIGH",
    createdAt: "2024-01-15T10:00:00Z",
    quotedAt: "2024-01-16T14:30:00Z",
    expiresAt: "2024-02-15T10:00:00Z",
    notes:
      "Customer requires delivery in multiple phases. First phase needed by end of month.",
    terms:
      "50% deposit required upon approval. Balance due before delivery. All prices valid for 30 days.",
    validityPeriod: 30,
    paymentTerms: "50% advance, 50% on delivery",
    deliveryTerms:
      "Free delivery within Nairobi. Charges apply for upcountry delivery.",
    estimatedDelivery: "2024-02-10T00:00:00Z",
    createdBy: {
      id: "staff-001",
      name: "John Kamau",
      email: "john.kamau@company.com",
    },
  };

  const handleApprove = async () => {
    setIsApproving(true);
    // Implement approval logic
    setTimeout(() => {
      setIsApproving(false);
      console.log("Quote approved");
    }, 2000);
  };

  const handleReject = (reason: string) => {
    // Implement rejection logic
    console.log("Quote rejected:", reason);
  };

  const handleConvertToOrders = () => {
    setConversionDialog(true);
  };

  const handleSendQuote = () => {
    // Implement send quote logic
    console.log("Sending quote to customer");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      DRAFT: {
        color: "bg-gray-100 text-gray-800",
        label: "Draft",
        icon: FileText,
      },
      QUOTED: {
        color: "bg-blue-100 text-blue-800",
        label: "Quoted",
        icon: Send,
      },
      APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Approved",
        icon: CheckCircle,
      },
      REJECTED: {
        color: "bg-red-100 text-red-800",
        label: "Rejected",
        icon: XCircle,
      },
      CONVERTED: {
        color: "bg-purple-100 text-purple-800",
        label: "Converted",
        icon: Package,
      },
      EXPIRED: {
        color: "bg-orange-100 text-orange-800",
        label: "Expired",
        icon: Clock,
      },
    }[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
      icon: FileText,
    };

    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      LOW: { color: "bg-green-100 text-green-800", label: "Low" },
      MEDIUM: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      HIGH: { color: "bg-orange-100 text-orange-800", label: "High" },
      URGENT: { color: "bg-red-100 text-red-800", label: "Urgent" },
    }[priority] || { color: "bg-gray-100 text-gray-800", label: priority };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDaysUntilExpiry = () => {
    const now = new Date();
    const expiry = new Date(bulkOrder.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/bulk-orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bulk Orders
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {bulkOrder.quoteNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(bulkOrder.status)}
              {getPriorityBadge(bulkOrder.priority)}
              {isExpiringSoon && (
                <Badge className="bg-orange-100 text-orange-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Expires in {daysUntilExpiry} days
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bulkOrder.status === "QUOTED" && !isExpired && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Quote</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this quote
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Rejection Reason</Label>
                      <Textarea
                        id="reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this quote is being rejected..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(rejectionReason)}
                      disabled={!rejectionReason.trim()}
                    >
                      Reject Quote
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={handleApprove} disabled={isApproving}>
                {isApproving ? (
                  <>Approving...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}

          {bulkOrder.status === "APPROVED" && (
            <Button onClick={handleConvertToOrders}>
              <Package className="h-4 w-4 mr-2" />
              Convert to Orders
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleSendQuote}>
                <Send className="mr-2 h-4 w-4" />
                Send to Customer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(bulkOrder.quoteNumber)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Quote Number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/admin/bulk-orders/${bulkOrder.id}/edit`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Quote
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calculator className="mr-2 h-4 w-4" />
                Recalculate Pricing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Quote expires in {daysUntilExpiry} days.</strong> Consider
            following up with the customer or extending the validity period.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Quote Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Quote Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Quote Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                  <CardDescription>{bulkOrder.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        ITEMS
                      </Label>
                      <p className="font-medium">{bulkOrder.items.length}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        TOTAL QUANTITY
                      </Label>
                      <p className="font-medium">
                        {bulkOrder.items
                          .reduce((sum, item) => sum + item.quantity, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        ESTIMATED DELIVERY
                      </Label>
                      <p className="font-medium">
                        {bulkOrder.estimatedDelivery
                          ? format(
                              new Date(bulkOrder.estimatedDelivery),
                              "MMM dd, yyyy"
                            )
                          : "TBD"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        VALIDITY
                      </Label>
                      <p className="font-medium">
                        {bulkOrder.validityPeriod} days
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${bulkOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (16%)</span>
                      <span>${bulkOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    {bulkOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${bulkOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${bulkOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Notes */}
              {bulkOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{bulkOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Items ({bulkOrder.items.length})</CardTitle>
                  <CardDescription>
                    Detailed breakdown of all items in this quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bulkOrder.items.map((item, index) => (
                      <Card key={item.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {item.productName}
                                </h4>
                                <Badge variant="outline">
                                  Item {index + 1}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    QUANTITY
                                  </Label>
                                  <p className="font-medium">
                                    {item.quantity.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    UNIT PRICE
                                  </Label>
                                  <p className="font-medium">
                                    ${item.unitPrice.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    TOTAL
                                  </Label>
                                  <p className="font-medium">
                                    ${item.totalPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Specifications */}
                              <div className="mt-3">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  SPECIFICATIONS
                                </Label>
                                <div className="mt-1 p-2 bg-muted rounded text-sm">
                                  <div className="grid gap-1">
                                    {Object.entries(item.specifications).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex justify-between"
                                        >
                                          <span className="font-medium">
                                            {key}:
                                          </span>
                                          <span>
                                            {Array.isArray(value)
                                              ? value.join(", ")
                                              : value}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms Tab */}
            <TabsContent value="terms">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {bulkOrder.terms}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {bulkOrder.paymentTerms}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {bulkOrder.deliveryTerms}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Quote History</CardTitle>
                  <CardDescription>
                    Timeline of actions taken on this quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Send className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Quote sent to customer</p>
                        <p className="text-sm text-muted-foreground">
                          {bulkOrder.quotedAt &&
                            format(
                              new Date(bulkOrder.quotedAt),
                              "MMM dd, yyyy 'at' hh:mm a"
                            )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Quote created</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(bulkOrder.createdAt),
                            "MMM dd, yyyy 'at' hh:mm a"
                          )}{" "}
                          by {bulkOrder.createdBy.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {bulkOrder.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{bulkOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {bulkOrder.customerId}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{bulkOrder.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{bulkOrder.customerPhone}</span>
                </div>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote Status */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Status</span>
                {getStatusBadge(bulkOrder.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Priority</span>
                {getPriorityBadge(bulkOrder.priority)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Created</span>
                <span className="text-sm">
                  {format(new Date(bulkOrder.createdAt), "MMM dd")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Expires</span>
                <span
                  className={`text-sm ${isExpiringSoon ? "text-orange-600" : ""}`}
                >
                  {format(new Date(bulkOrder.expiresAt), "MMM dd")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Valid for</span>
                <span className="text-sm">{bulkOrder.validityPeriod} days</span>
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
                onClick={handleSendQuote}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Quote
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversion Dialog */}
      <Dialog open={conversionDialog} onOpenChange={setConversionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convert to Orders</DialogTitle>
            <DialogDescription>
              Convert this approved quote into individual orders for processing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                This will create {bulkOrder.items.length} separate orders, one
                for each item type. Each order can be processed independently.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Conversion Options</Label>
              <Select defaultValue="separate">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="separate">
                    Create separate orders for each item
                  </SelectItem>
                  <SelectItem value="combined">
                    Create single combined order
                  </SelectItem>
                  <SelectItem value="custom">Custom grouping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConversionDialog(false)}
            >
              Cancel
            </Button>
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Convert to Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

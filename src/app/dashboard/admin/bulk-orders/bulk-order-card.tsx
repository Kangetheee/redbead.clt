/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Package,
  User,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Calculator,
  Mail,
  Phone,
  Zap,
  ExternalLink,
  Copy,
  TrendingUp,
  Users,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface BulkOrder {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  description: string;
  itemCount: number;
  totalQuantity: number;
  estimatedValue: number;
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
  convertedToOrders?: number;
  progress?: number;
  notes?: string;
  validityPeriod?: number;
  estimatedDelivery?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface BulkOrderCardProps {
  order: BulkOrder;
  variant?: "default" | "compact" | "detailed" | "summary";
  showActions?: boolean;
  className?: string;
  onStatusUpdate?: (orderId: string, status: string) => void;
  onSendQuote?: (orderId: string) => void;
  onApprove?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onConvert?: (orderId: string) => void;
}

export default function BulkOrderCard({
  order,
  variant = "default",
  showActions = true,
  className,
  onStatusUpdate,
  onSendQuote,
  onApprove,
  onReject,
  onConvert,
}: BulkOrderCardProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      DRAFT: {
        color: "bg-gray-100 text-gray-800",
        label: "Draft",
        icon: FileText,
        variant: "secondary" as const,
      },
      QUOTED: {
        color: "bg-blue-100 text-blue-800",
        label: "Quoted",
        icon: Send,
        variant: "default" as const,
      },
      APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Approved",
        icon: CheckCircle,
        variant: "default" as const,
      },
      REJECTED: {
        color: "bg-red-100 text-red-800",
        label: "Rejected",
        icon: XCircle,
        variant: "destructive" as const,
      },
      CONVERTED: {
        color: "bg-purple-100 text-purple-800",
        label: "Converted",
        icon: Package,
        variant: "default" as const,
      },
      EXPIRED: {
        color: "bg-orange-100 text-orange-800",
        label: "Expired",
        icon: Clock,
        variant: "destructive" as const,
      },
    }[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
      icon: FileText,
      variant: "secondary" as const,
    };

    return configs;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      LOW: {
        color: "bg-green-100 text-green-800",
        label: "Low",
        variant: "secondary" as const,
      },
      MEDIUM: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Medium",
        variant: "outline" as const,
      },
      HIGH: {
        color: "bg-orange-100 text-orange-800",
        label: "High",
        variant: "destructive" as const,
      },
      URGENT: {
        color: "bg-red-100 text-red-800",
        label: "Urgent",
        variant: "destructive" as const,
      },
    }[priority] || {
      color: "bg-gray-100 text-gray-800",
      label: priority,
      variant: "secondary" as const,
    };

    return configs;
  };

  const getDaysUntilExpiry = () => {
    const now = new Date();
    const expiry = new Date(order.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const statusConfig = getStatusConfig(order.status);
  const priorityConfig = getPriorityConfig(order.priority);
  const StatusIcon = statusConfig.icon;
  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry <= 0;

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <StatusIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Link
                  href={`/dashboard/admin/bulk-orders/${order.id}`}
                  className="font-medium hover:underline"
                >
                  {order.quoteNumber}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {order.customerName} • $
                  {order.estimatedValue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              {order.priority !== "LOW" && (
                <Badge className={priorityConfig.color}>
                  {priorityConfig.label}
                </Badge>
              )}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/admin/bulk-orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/admin/bulk-orders/${order.id}/edit`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary variant for dashboard overview
  if (variant === "summary") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/bulk-orders/${order.id}`}
                  className="font-semibold hover:underline"
                >
                  {order.quoteNumber}
                </Link>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>

              <p className="text-muted-foreground">{order.customerName}</p>
              <p className="text-sm line-clamp-2">{order.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{order.itemCount} items</span>
                <span>{order.totalQuantity.toLocaleString()} qty</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">
                ${order.estimatedValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {isExpired ? "Expired" : `${daysUntilExpiry} days left`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {order.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/dashboard/admin/bulk-orders/${order.id}`}
                className="font-semibold hover:underline"
              >
                {order.quoteNumber}
              </Link>
              <p className="text-sm text-muted-foreground">
                {order.customerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.priority !== "LOW" && (
              <Badge className={priorityConfig.color}>
                <Zap className="h-3 w-3 mr-1" />
                {priorityConfig.label}
              </Badge>
            )}
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/admin/bulk-orders/${order.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/admin/bulk-orders/${order.id}/edit`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Quote
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {order.status === "DRAFT" && (
                    <DropdownMenuItem onClick={() => onSendQuote?.(order.id)}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Quote
                    </DropdownMenuItem>
                  )}
                  {order.status === "QUOTED" && !isExpired && (
                    <>
                      <DropdownMenuItem onClick={() => onApprove?.(order.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReject?.(order.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  {order.status === "APPROVED" && (
                    <DropdownMenuItem onClick={() => onConvert?.(order.id)}>
                      <Package className="mr-2 h-4 w-4" />
                      Convert to Orders
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => copyToClipboard(order.quoteNumber)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Quote Number
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Expiry Warning */}
        {(isExpiringSoon || isExpired) && (
          <div
            className={`mt-3 p-2 rounded-lg border ${
              isExpired
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-orange-200 bg-orange-50 text-orange-800"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {isExpired
                  ? `Quote expired ${Math.abs(daysUntilExpiry)} days ago`
                  : `Expires in ${daysUntilExpiry} days`}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {order.description}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{order.itemCount} Items</p>
              <p className="text-xs text-muted-foreground">
                {order.totalQuantity.toLocaleString()} total qty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                ${order.estimatedValue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Estimated value</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {format(new Date(order.createdAt), "MMM dd")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isExpired ? "Expired" : `${daysUntilExpiry}d left`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isExpired ? "Quote expired" : "Until expiry"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress for converted orders */}
        {order.status === "CONVERTED" && order.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Conversion Progress</span>
              <span>{order.progress}%</span>
            </div>
            <Progress value={order.progress} className="h-2" />
            {order.convertedToOrders && (
              <p className="text-xs text-muted-foreground">
                {order.convertedToOrders} orders created
              </p>
            )}
          </div>
        )}

        {/* Detailed information for detailed variant */}
        {variant === "detailed" && (
          <>
            <Separator />

            <div className="space-y-3">
              {/* Customer Contact */}
              {(order.customerEmail || order.customerPhone) && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    CONTACT
                  </p>
                  <div className="space-y-1">
                    {order.customerEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{order.customerEmail}</span>
                      </div>
                    )}
                    {order.customerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  TIMELINE
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {order.quotedAt && (
                    <div className="flex justify-between">
                      <span>Quoted:</span>
                      <span>
                        {format(new Date(order.quotedAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>
                      {format(new Date(order.expiresAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span>Est. Delivery:</span>
                      <span>
                        {format(
                          new Date(order.estimatedDelivery),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Created By */}
              {order.createdBy && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    CREATED BY
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {order.createdBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {order.createdBy.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdBy.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/admin/bulk-orders/${order.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>

            {order.status === "QUOTED" && !isExpired && (
              <Button className="flex-1" onClick={() => onApprove?.(order.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}

            {order.status === "APPROVED" && (
              <Button className="flex-1" onClick={() => onConvert?.(order.id)}>
                <Package className="h-4 w-4 mr-2" />
                Convert
              </Button>
            )}

            {order.status === "DRAFT" && (
              <Button
                className="flex-1"
                onClick={() => onSendQuote?.(order.id)}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Quote
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href={`/dashboard/admin/bulk-orders/${order.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

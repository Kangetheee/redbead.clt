/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  FileText,
  User,
  Smile,
  AlertCircle,
  MapPin,
  Star,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { OrderResponse } from "@/lib/orders/types/orders.types";

interface CustomerOrderTimelineProps {
  order: OrderResponse;
  showEstimates?: boolean;
  compact?: boolean;
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon: React.ElementType;
  iconColor: string;
  status: "completed" | "current" | "upcoming";
  customerAction?: {
    required: boolean;
    actionText: string;
    actionUrl?: string;
  };
}

export default function CustomerOrderTimeline({
  order,
  showEstimates = true,
  compact = false,
}: CustomerOrderTimelineProps) {
  // Generate customer-friendly timeline events
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Order placed
    events.push({
      id: "order_placed",
      title: "Order Placed",
      description: `Order #${order.orderNumber} was successfully placed`,
      timestamp: order.createdAt,
      icon: Package,
      iconColor: "text-green-500",
      status: "completed",
    });

    // Payment status
    if (order.payment) {
      events.push({
        id: "payment_processed",
        title: "Payment Confirmed",
        description: `Payment of $${order.totalAmount.toFixed(2)} was processed successfully`,
        timestamp: order.updatedAt, // Use order updated time as fallback
        icon: CreditCard,
        iconColor: "text-green-500",
        status: "completed",
      });
    } else {
      events.push({
        id: "payment_pending",
        title: "Payment Required",
        description: "Please complete your payment to proceed with production",
        timestamp: order.createdAt,
        icon: CreditCard,
        iconColor: "text-orange-500",
        status: "current",
        customerAction: {
          required: true,
          actionText: "Complete Payment",
          actionUrl: `/dashboard/customer/orders/${order.id}/payment`,
        },
      });
    }

    // Design approval workflow
    if (order.designApprovalRequired) {
      if (order.designApproval) {
        if (order.designApproval.status === "PENDING") {
          events.push({
            id: "design_approval_needed",
            title: "Design Approval Needed",
            description: "Please review and approve your design mockups",
            timestamp: order.designApproval.requestedAt,
            icon: FileText,
            iconColor: "text-blue-500",
            status: "current",
            customerAction: {
              required: true,
              actionText: "Review Design",
              actionUrl: `/dashboard/customer/orders/${order.id}/design-approval`,
            },
          });
        } else if (order.designApproval.status === "APPROVED") {
          events.push({
            id: "design_approved",
            title: "Design Approved",
            description:
              "Thank you! Your design has been approved and sent to production",
            timestamp: order.designApproval.respondedAt || order.updatedAt,
            icon: CheckCircle,
            iconColor: "text-green-500",
            status: "completed",
          });
        } else if (order.designApproval.status === "REJECTED") {
          events.push({
            id: "design_revision",
            title: "Design Revision Requested",
            description:
              order.designApproval.rejectionReason ||
              "Design changes requested",
            timestamp: order.designApproval.respondedAt || order.updatedAt,
            icon: AlertCircle,
            iconColor: "text-yellow-500",
            status: "current",
          });
        }
      }
    }

    // Production stages
    if (
      ["PROCESSING", "PRODUCTION", "SHIPPED", "DELIVERED"].includes(
        order.status
      )
    ) {
      events.push({
        id: "production_started",
        title: "Production Started",
        description: "Your order is now in production",
        timestamp: order.updatedAt,
        icon: Package,
        iconColor: "text-blue-500",
        status: "completed",
      });
    } else if (
      order.payment &&
      (!order.designApprovalRequired ||
        order.designApproval?.status === "APPROVED")
    ) {
      events.push({
        id: "production_upcoming",
        title: "Production Scheduled",
        description: "Your order will begin production soon",
        timestamp: new Date(
          new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
        icon: Package,
        iconColor: "text-gray-400",
        status: "upcoming",
      });
    }

    // Shipping
    if (["SHIPPED", "DELIVERED"].includes(order.status)) {
      events.push({
        id: "order_shipped",
        title: "Order Shipped",
        description: order.trackingNumber
          ? `Your order has been shipped. Tracking: ${order.trackingNumber}`
          : "Your order has been shipped and is on its way",
        timestamp: order.updatedAt,
        icon: Truck,
        iconColor: "text-blue-500",
        status: "completed",
      });
    } else if (["PROCESSING", "PRODUCTION"].includes(order.status)) {
      // Estimate shipping date
      const estimatedShipDate = order.expectedDelivery
        ? new Date(
            new Date(order.expectedDelivery).getTime() - 2 * 24 * 60 * 60 * 1000
          )
        : new Date(
            new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000
          );

      events.push({
        id: "shipping_upcoming",
        title: "Shipping Scheduled",
        description: showEstimates
          ? `Estimated to ship ${format(estimatedShipDate, "MMM dd")}`
          : "Your order will ship once production is complete",
        timestamp: estimatedShipDate.toISOString(),
        icon: Truck,
        iconColor: "text-gray-400",
        status: "upcoming",
      });
    }

    // Delivery
    if (order.status === "DELIVERED") {
      events.push({
        id: "order_delivered",
        title: "Order Delivered",
        description: "Your order has been successfully delivered!",
        timestamp: order.updatedAt,
        icon: CheckCircle,
        iconColor: "text-green-500",
        status: "completed",
      });

      // Add feedback request
      events.push({
        id: "feedback_request",
        title: "How did we do?",
        description: "We'd love to hear about your experience",
        timestamp: new Date(
          new Date(order.updatedAt).getTime() + 1 * 60 * 60 * 1000
        ).toISOString(),
        icon: Star,
        iconColor: "text-yellow-500",
        status: "current",
        customerAction: {
          required: false,
          actionText: "Leave Review",
          actionUrl: `/dashboard/customer/orders/${order.id}/review`,
        },
      });
    } else if (order.expectedDelivery) {
      events.push({
        id: "delivery_upcoming",
        title: "Delivery Scheduled",
        description: `Expected delivery: ${format(new Date(order.expectedDelivery), "MMM dd, yyyy")}`,
        timestamp: order.expectedDelivery,
        icon: MapPin,
        iconColor: "text-gray-400",
        status: "upcoming",
      });
    }

    return events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [order, showEstimates]);

  if (compact) {
    return (
      <div className="space-y-3">
        {timelineEvents.slice(0, 4).map((event, index) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-full ${
                  event.status === "completed"
                    ? "bg-green-100"
                    : event.status === "current"
                      ? "bg-blue-100"
                      : "bg-gray-100"
                }`}
              >
                <Icon className={`h-3 w-3 ${event.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {event.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {event.status === "upcoming"
                  ? format(new Date(event.timestamp), "MMM dd")
                  : formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Progress
        </CardTitle>
        <CardDescription>
          Track your order from placement to delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          {timelineEvents.map((event, index) => {
            const Icon = event.icon;
            const isLast = index === timelineEvents.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background ${
                    event.status === "completed"
                      ? "bg-green-100"
                      : event.status === "current"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${event.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium ${
                            event.status === "current" ? "text-blue-600" : ""
                          }`}
                        >
                          {event.title}
                        </h4>
                        {event.status === "current" && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {event.customerAction?.required && (
                          <Badge variant="destructive" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <time dateTime={event.timestamp}>
                          {event.status === "upcoming" ? (
                            <>
                              Expected:{" "}
                              {format(
                                new Date(event.timestamp),
                                "MMM dd, yyyy"
                              )}
                            </>
                          ) : (
                            format(
                              new Date(event.timestamp),
                              "MMM dd, yyyy 'at' hh:mm a"
                            )
                          )}
                        </time>
                        {event.status !== "upcoming" && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(event.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      {event.customerAction && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant={
                              event.customerAction.required
                                ? "default"
                                : "outline"
                            }
                            asChild={!!event.customerAction.actionUrl}
                          >
                            {event.customerAction.actionUrl ? (
                              <a href={event.customerAction.actionUrl}>
                                {event.customerAction.actionText}
                              </a>
                            ) : (
                              event.customerAction.actionText
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-medium">
                {timelineEvents.filter((e) => e.status === "completed").length}
              </p>
              <p className="text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="font-medium">
                {timelineEvents.filter((e) => e.status === "current").length}
              </p>
              <p className="text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="font-medium">
                {timelineEvents.filter((e) => e.status === "upcoming").length}
              </p>
              <p className="text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Customer Actions Summary */}
        {timelineEvents.some((e) => e.customerAction?.required) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Action Required
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Your order is waiting for your input to continue processing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Phone,
  AlertTriangle,
  Navigation,
  Home,
  Building,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { OrderResponse } from "@/lib/orders/types/orders.types";

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
}

interface CustomerOrderTrackingProps {
  order: OrderResponse;
  showEstimates?: boolean;
  autoRefresh?: boolean;
}

export default function CustomerOrderTracking({
  order,
  showEstimates = true,
  autoRefresh = false,
}: CustomerOrderTrackingProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock tracking data - in real app, fetch from tracking API
  useEffect(() => {
    if (order.trackingNumber) {
      // Simulate tracking events based on order status
      const events: TrackingEvent[] = [
        {
          id: "1",
          status: "Order Processed",
          description:
            "Your order has been processed and is ready for shipment",
          location: "Fulfillment Center - Nairobi",
          timestamp: order.createdAt,
          type: "success",
        },
      ];

      if (["SHIPPED", "DELIVERED"].includes(order.status)) {
        events.push(
          {
            id: "2",
            status: "Package Shipped",
            description:
              "Your package has been picked up by our shipping partner",
            location: "Fulfillment Center - Nairobi",
            timestamp: new Date(
              new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            type: "success",
          },
          {
            id: "3",
            status: "In Transit",
            description: "Package is on its way to the destination city",
            location: "Sorting Facility - Nairobi",
            timestamp: new Date(
              new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            type: "info",
          }
        );

        if (order.status === "DELIVERED") {
          events.push({
            id: "4",
            status: "Delivered",
            description: "Package has been successfully delivered",
            location: "Delivered to recipient",
            timestamp: order.updatedAt,
            type: "success",
          });
        } else {
          events.push({
            id: "4",
            status: "Out for Delivery",
            description: "Package is out for delivery and will arrive today",
            location: "Local Delivery Hub",
            timestamp: new Date().toISOString(),
            type: "info",
          });
        }
      }

      setTrackingEvents(events);
    }
  }, [order]);

  // Auto-refresh tracking data
  useEffect(() => {
    if (autoRefresh && order.trackingNumber && order.status === "SHIPPED") {
      const interval = setInterval(
        () => {
          handleRefreshTracking();
        },
        5 * 60 * 1000
      ); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, order.trackingNumber, order.status]);

  const handleRefreshTracking = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const getTrackingProgress = () => {
    if (!order.trackingNumber) return 0;

    if (order.status === "DELIVERED") return 100;
    if (order.status === "SHIPPED") return 75;
    if (["PROCESSING", "PRODUCTION"].includes(order.status)) return 25;
    return 0;
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const getDeliveryEstimate = () => {
    if (order.expectedDelivery) {
      return format(new Date(order.expectedDelivery), "EEEE, MMMM dd");
    }

    // Calculate estimate based on creation date and urgency
    const baseDeliveryDays =
      order.urgencyLevel === "RUSH"
        ? 2
        : order.urgencyLevel === "EMERGENCY"
          ? 1
          : 5;
    const estimatedDate = new Date(order.createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + baseDeliveryDays);

    return format(estimatedDate, "EEEE, MMMM dd");
  };

  // If no tracking number, show pre-shipment status
  if (!order.trackingNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status
          </CardTitle>
          <CardDescription>
            Your order is being prepared for shipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Order #{order.orderNumber}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {order.status === "PENDING" && "Your order is being processed"}
                {order.status === "DESIGN_PENDING" &&
                  "Waiting for design approval"}
                {order.status === "PAYMENT_PENDING" &&
                  "Waiting for payment confirmation"}
                {order.status === "PROCESSING" && "Your order is in production"}
                {order.status === "PRODUCTION" &&
                  "Your order is being manufactured"}
              </p>
            </div>

            {showEstimates && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Estimated Delivery</p>
                <p className="text-lg font-bold text-blue-600">
                  {getDeliveryEstimate()}
                </p>
              </div>
            )}
          </div>

          {order.status === "DESIGN_PENDING" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> Please review and approve your
                design to continue production.
                <Button variant="link" size="sm" className="ml-2 p-0 h-auto">
                  Review Design
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {order.status === "PAYMENT_PENDING" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment Required:</strong> Complete your payment to
                start production.
                <Button variant="link" size="sm" className="ml-2 p-0 h-auto">
                  Complete Payment
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tracking Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Package Tracking
              </CardTitle>
              <CardDescription>Track your package in real-time</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTracking}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              {order.trackingUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Carrier Site
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tracking Number */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Tracking Number</p>
              <p className="font-mono text-lg">{order.trackingNumber}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigator.clipboard.writeText(order.trackingNumber!)
              }
            >
              Copy
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Delivery Progress</span>
              <span>{getTrackingProgress()}%</span>
            </div>
            <Progress value={getTrackingProgress()} className="h-2" />
          </div>

          {/* Delivery Estimate */}
          {showEstimates && order.expectedDelivery && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Expected Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(order.expectedDelivery),
                      "EEEE, MMMM dd 'by' h:mm a"
                    )}
                  </p>
                </div>
              </div>

              {order.status === "SHIPPED" && (
                <Badge className="bg-green-100 text-green-800">On Time</Badge>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {format(lastUpdated, "MMM dd, yyyy 'at' h:mm a")}
          </div>
        </CardContent>
      </Card>

      {/* Tracking Events */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking History</CardTitle>
          <CardDescription>
            Detailed movement history of your package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingEvents.map((event, index) => {
              const Icon = getStatusIcon(event.type);
              const isLatest = index === trackingEvents.length - 1;

              return (
                <div key={event.id} className="relative">
                  {index < trackingEvents.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}

                  <div className="flex gap-4">
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background ${
                        isLatest
                          ? "bg-blue-100 ring-2 ring-blue-200"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${getStatusColor(event.type)}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${isLatest ? "text-blue-600" : ""}`}
                          >
                            {event.status}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(event.timestamp),
                                  "MMM dd, h:mm a"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isLatest && (
                          <Badge variant="secondary" className="ml-2">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Delivery Address</h4>
            <p className="text-sm text-muted-foreground">
              Address ID: {order.shippingAddress.id}
              {/* In real app, display full address */}
            </p>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Contact Carrier
            </Button>
            <Button variant="outline" className="justify-start">
              <Navigation className="h-4 w-4 mr-2" />
              Delivery Instructions
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Delivery Note:</strong> Please ensure someone is available
              to receive the package. If no one is available, the carrier will
              attempt redelivery the next business day.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Having issues with your delivery? Our customer support team is
              here to help.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

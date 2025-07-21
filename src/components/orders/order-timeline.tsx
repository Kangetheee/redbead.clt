/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Truck,
  CreditCard,
  User,
  MessageSquare,
  Edit,
  Mail,
  Phone,
  FileText,
  Calendar,
  MapPin,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { OrderResponse, OrderNote } from "@/lib/orders/types/orders.types";
import { useOrderNotes } from "@/hooks/use-orders";

interface TimelineEvent {
  id: string;
  type:
    | "STATUS_CHANGE"
    | "NOTE_ADDED"
    | "PAYMENT"
    | "SHIPPING"
    | "DESIGN"
    | "SYSTEM"
    | "CUSTOMER_ACTION";
  title: string;
  description?: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role: "CUSTOMER" | "ADMIN" | "SYSTEM";
  };
  metadata?: Record<string, any>;
  icon: React.ElementType;
  iconColor: string;
  isImportant?: boolean;
  relatedItems?: Array<{
    type: "ORDER" | "PAYMENT" | "SHIPMENT" | "DESIGN";
    id: string;
    label: string;
    url?: string;
  }>;
}

interface OrderTimelineProps {
  order: OrderResponse;
  showEstimates?: boolean;
  compact?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
}

export default function OrderTimeline({
  order,
  showEstimates = true,
  compact = false,
}: OrderTimelineProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showSystemEvents, setShowSystemEvents] = useState(false);

  // Fetch notes using the hook
  const { data: notesData } = useOrderNotes(order.id);
  const notes: OrderNote[] = notesData?.success ? notesData.data || [] : [];

  // Helper functions - moved before useMemo
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return CheckCircle;
      case "SHIPPED":
        return Truck;
      case "CANCELLED":
        return XCircle;
      case "PROCESSING":
        return Package;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-500";
      case "SHIPPED":
        return "text-blue-500";
      case "CANCELLED":
        return "text-red-500";
      case "PROCESSING":
        return "text-purple-500";
      default:
        return "text-yellow-500";
    }
  };

  // Generate timeline events from order data
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Order creation
    events.push({
      id: "order_created",
      type: "SYSTEM",
      title: "Order Created",
      description: `Order #${order.orderNumber} was placed`,
      timestamp: order.createdAt,
      icon: Package,
      iconColor: "text-blue-500",
      isImportant: true,
      actor: {
        id: order.customerId,
        name: "Customer", // In real app, get from customer data
        role: "CUSTOMER",
      },
    });

    // Status changes (generate from current status and timestamps)
    const statusHistory = [
      {
        status: "PENDING",
        timestamp: order.createdAt,
        description: "Order received and confirmed",
      },
      // Add more status changes based on order data
      ...(order.status !== "PENDING"
        ? [
            {
              status: order.status,
              timestamp: order.updatedAt,
              description: `Order status updated to ${order.status.replace(/_/g, " ")}`,
            },
          ]
        : []),
    ];

    statusHistory.forEach((statusChange, index) => {
      events.push({
        id: `status_${statusChange.status}_${index}`,
        type: "STATUS_CHANGE",
        title: `Status Updated to ${statusChange.status.replace(/_/g, " ")}`,
        description: statusChange.description,
        timestamp: statusChange.timestamp,
        icon: getStatusIcon(statusChange.status),
        iconColor: getStatusColor(statusChange.status),
        isImportant: true,
        actor: {
          id: "system",
          name: "System",
          role: "SYSTEM",
        },
      });
    });

    // Payment events
    if (order.payment) {
      events.push({
        id: "payment_processed",
        type: "PAYMENT",
        title: "Payment Processed",
        description: `Payment of $${order.totalAmount.toFixed(2)} confirmed`,
        timestamp: order.updatedAt, // Use order updated time as fallback
        icon: CreditCard,
        iconColor: "text-green-500",
        isImportant: true,
        actor: {
          id: "payment_system",
          name: "Payment System",
          role: "SYSTEM",
        },
        relatedItems: [
          {
            type: "PAYMENT",
            id: order.payment.transactionId || "txn_123",
            label: `Transaction ${order.payment.transactionId || "txn_123"}`,
          },
        ],
      });
    }

    // Shipping events
    if (order.trackingNumber) {
      events.push({
        id: "order_shipped",
        type: "SHIPPING",
        title: "Order Shipped",
        description: `Package shipped with tracking number ${order.trackingNumber}`,
        timestamp: order.updatedAt,
        icon: Truck,
        iconColor: "text-blue-500",
        isImportant: true,
        actor: {
          id: "shipping_team",
          name: "Shipping Team",
          role: "ADMIN",
        },
        relatedItems: [
          {
            type: "SHIPMENT",
            id: order.trackingNumber,
            label: `Track Package`,
            url: order.trackingUrl || undefined,
          },
        ],
      });
    }

    // Design approval events
    if (order.designApprovalRequired && order.designApproval) {
      events.push({
        id: "design_approval_requested",
        type: "DESIGN",
        title: "Design Approval Requested",
        description: "Customer review required for design mockups",
        timestamp: order.designApproval.requestedAt,
        icon: FileText,
        iconColor: "text-orange-500",
        actor: {
          id: "design_team",
          name: "Design Team",
          role: "ADMIN",
        },
      });

      if (order.designApproval.status !== "PENDING") {
        events.push({
          id: "design_approval_completed",
          type: "DESIGN",
          title: `Design ${order.designApproval.status}`,
          description:
            order.designApproval.rejectionReason ||
            "Design approved by customer",
          timestamp:
            order.designApproval.respondedAt || new Date().toISOString(),
          icon:
            order.designApproval.status === "APPROVED" ? CheckCircle : XCircle,
          iconColor:
            order.designApproval.status === "APPROVED"
              ? "text-green-500"
              : "text-red-500",
          isImportant: true,
          actor: {
            id: order.customerId,
            name: "Customer",
            role: "CUSTOMER",
          },
        });
      }
    }

    // Notes as events
    notes.forEach((note) => {
      events.push({
        id: `note_${note.id}`,
        type: "NOTE_ADDED",
        title: note.title || `${note.noteType} Note Added`,
        description: note.content,
        timestamp: note.createdAt,
        icon: MessageSquare,
        iconColor: "text-purple-500",
        actor: note.user
          ? {
              id: note.user.id,
              name: note.user.name,
              avatar: note.user.avatar,
              role: "ADMIN",
            }
          : undefined,
        metadata: {
          noteType: note.noteType,
          priority: note.priority,
          isInternal: note.isInternal,
        },
      });
    });

    // System events (if enabled)
    if (showSystemEvents) {
      events.push({
        id: "order_email_sent",
        type: "SYSTEM",
        title: "Confirmation Email Sent",
        description: "Order confirmation email sent to customer",
        timestamp: new Date(
          new Date(order.createdAt).getTime() + 5 * 60 * 1000
        ).toISOString(),
        icon: Mail,
        iconColor: "text-gray-500",
        actor: {
          id: "email_system",
          name: "Email System",
          role: "SYSTEM",
        },
      });
    }

    // Sort by timestamp (newest first)
    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [order, notes, showSystemEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterType === "all") return timelineEvents;
    return timelineEvents.filter((event) =>
      filterType === "important"
        ? event.isImportant
        : event.type === filterType.toUpperCase()
    );
  }, [timelineEvents, filterType]);

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getEventFilterOptions = () => [
    { value: "all", label: "All Events" },
    { value: "important", label: "Important Only" },
    { value: "STATUS_CHANGE", label: "Status Changes" },
    { value: "PAYMENT", label: "Payments" },
    { value: "SHIPPING", label: "Shipping" },
    { value: "DESIGN", label: "Design" },
    { value: "NOTE_ADDED", label: "Notes" },
    { value: "SYSTEM", label: "System Events" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Timeline
            </CardTitle>
            <CardDescription>
              Complete history and activity for order #{order.orderNumber}
            </CardDescription>
          </div>

          {showEstimates && (
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter events" />
                </SelectTrigger>
                <SelectContent>
                  {getEventFilterOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSystemEvents(!showSystemEvents)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showSystemEvents ? "Hide" : "Show"} System
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredEvents.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No events found for the selected filter.
            </AlertDescription>
          </Alert>
        ) : (
          <div className={compact ? "compact-class" : "regular-class"}>
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            {filteredEvents.map((event, index) => {
              const Icon = event.icon;
              const isExpanded = expandedEvents.has(event.id);
              const hasDetails =
                event.description ||
                event.relatedItems?.length ||
                event.metadata;

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-card ${event.isImportant ? "ring-2 ring-primary/20" : ""}`}
                  >
                    <Icon className={`h-5 w-5 ${event.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`text-sm font-medium ${event.isImportant ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {event.title}
                          </h4>
                          {event.isImportant && (
                            <Badge variant="secondary" className="text-xs">
                              Important
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <time dateTime={event.timestamp}>
                            {format(
                              new Date(event.timestamp),
                              "MMM dd, yyyy 'at' hh:mm a"
                            )}
                          </time>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(event.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {event.actor && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={event.actor.avatar} />
                              <AvatarFallback className="text-xs">
                                {event.actor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {event.actor.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.actor.role}
                            </Badge>
                          </div>
                        )}

                        {event.description && !isExpanded && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {hasDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEventExpansion(event.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && hasDetails && (
                      <Collapsible open={isExpanded}>
                        <CollapsibleContent className="mt-3 space-y-3">
                          {event.description && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{event.description}</p>
                            </div>
                          )}

                          {event.relatedItems &&
                            event.relatedItems.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium text-muted-foreground">
                                  RELATED ITEMS
                                </h5>
                                <div className="space-y-1">
                                  {event.relatedItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                    >
                                      <span>{item.label}</span>
                                      {item.url && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                        >
                                          <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {event.metadata && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground">
                                DETAILS
                              </h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(event.metadata).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex justify-between"
                                    >
                                      <span className="text-muted-foreground">
                                        {key}:
                                      </span>
                                      <span>{String(value)}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline Statistics */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{timelineEvents.length}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {timelineEvents.filter((e) => e.isImportant).length}
              </p>
              <p className="text-xs text-muted-foreground">Important</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(
                  (new Date().getTime() - new Date(order.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

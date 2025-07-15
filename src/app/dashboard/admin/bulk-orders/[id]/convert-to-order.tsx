/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Package,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Settings,
  Loader2,
  ArrowRight,
  FileText,
  Zap,
  Target,
  Split,
  Combine,
  Edit,
  Trash2,
  Copy,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

// Types
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
  description: string;
  items: BulkOrderItem[];
  totalAmount: number;
  estimatedDelivery?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
}

interface OrderGroup {
  id: string;
  name: string;
  items: BulkOrderItem[];
  urgencyLevel: "NORMAL" | "EXPEDITED" | "RUSH" | "EMERGENCY";
  expectedProductionDays: number;
  designApprovalRequired: boolean;
  specialInstructions: string;
  estimatedValue: number;
}

interface ConversionResult {
  orderId: string;
  orderNumber: string;
  status: "success" | "failed";
  error?: string;
}

interface ConvertToOrderProps {
  bulkOrder: BulkOrder;
  onConversionComplete?: (results: ConversionResult[]) => void;
  onCancel?: () => void;
}

type ConversionStrategy = "separate" | "combined" | "custom";

export default function ConvertToOrder({
  bulkOrder,
  onConversionComplete,
  onCancel,
}: ConvertToOrderProps) {
  const [step, setStep] = useState(1);
  const [strategy, setStrategy] = useState<ConversionStrategy>("separate");
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionResults, setConversionResults] = useState<
    ConversionResult[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);

  // Global order settings
  const [globalSettings, setGlobalSettings] = useState({
    urgencyLevel: "NORMAL" as const,
    expectedProductionDays: 5,
    designApprovalRequired: true,
    paymentMethod: "MPESA" as const,
    shippingAddressId: "",
    billingAddressId: "",
    specialInstructions: bulkOrder.notes || "",
  });

  // Initialize order groups based on strategy
  const initializeOrderGroups = (selectedStrategy: ConversionStrategy) => {
    let groups: OrderGroup[] = [];

    switch (selectedStrategy) {
      case "separate":
        groups = bulkOrder.items.map((item, index) => ({
          id: `group-${index + 1}`,
          name: `Order ${index + 1}: ${item.productName}`,
          items: [item],
          urgencyLevel: "NORMAL",
          expectedProductionDays: 5,
          designApprovalRequired: true,
          specialInstructions: "",
          estimatedValue: item.totalPrice,
        }));
        break;

      case "combined":
        groups = [
          {
            id: "group-1",
            name: `Combined Order: ${bulkOrder.description}`,
            items: bulkOrder.items,
            urgencyLevel: "NORMAL",
            expectedProductionDays: 7,
            designApprovalRequired: true,
            specialInstructions: bulkOrder.notes || "",
            estimatedValue: bulkOrder.totalAmount,
          },
        ];
        break;

      case "custom":
        // Start with separate groups, user can merge/split
        groups = bulkOrder.items.map((item, index) => ({
          id: `group-${index + 1}`,
          name: `Group ${index + 1}`,
          items: [item],
          urgencyLevel: "NORMAL",
          expectedProductionDays: 5,
          designApprovalRequired: true,
          specialInstructions: "",
          estimatedValue: item.totalPrice,
        }));
        break;
    }

    setOrderGroups(groups);
  };

  // Handle strategy change
  const handleStrategyChange = (newStrategy: ConversionStrategy) => {
    setStrategy(newStrategy);
    initializeOrderGroups(newStrategy);
  };

  // Initialize with default strategy
  React.useEffect(() => {
    initializeOrderGroups(strategy);
  }, []);

  // Custom grouping functions
  const mergeGroups = (groupIds: string[]) => {
    if (groupIds.length < 2) return;

    const groupsToMerge = orderGroups.filter((g) => groupIds.includes(g.id));
    const remainingGroups = orderGroups.filter((g) => !groupIds.includes(g.id));

    const mergedItems = groupsToMerge.flatMap((g) => g.items);
    const mergedValue = groupsToMerge.reduce(
      (sum, g) => sum + g.estimatedValue,
      0
    );

    const newGroup: OrderGroup = {
      id: `merged-${Date.now()}`,
      name: `Merged Group (${groupsToMerge.length} groups)`,
      items: mergedItems,
      urgencyLevel: "NORMAL",
      expectedProductionDays: Math.max(
        ...groupsToMerge.map((g) => g.expectedProductionDays)
      ),
      designApprovalRequired: true,
      specialInstructions: "",
      estimatedValue: mergedValue,
    };

    setOrderGroups([...remainingGroups, newGroup]);
  };

  const splitGroup = (groupId: string) => {
    const group = orderGroups.find((g) => g.id === groupId);
    if (!group || group.items.length <= 1) return;

    const otherGroups = orderGroups.filter((g) => g.id !== groupId);
    const newGroups = group.items.map((item, index) => ({
      id: `split-${groupId}-${index}`,
      name: `${item.productName}`,
      items: [item],
      urgencyLevel: group.urgencyLevel,
      expectedProductionDays: group.expectedProductionDays,
      designApprovalRequired: group.designApprovalRequired,
      specialInstructions: group.specialInstructions,
      estimatedValue: item.totalPrice,
    }));

    setOrderGroups([...otherGroups, ...newGroups]);
  };

  const updateGroup = (groupId: string, updates: Partial<OrderGroup>) => {
    setOrderGroups((groups) =>
      groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  };

  const removeGroup = (groupId: string) => {
    setOrderGroups((groups) => groups.filter((g) => g.id !== groupId));
  };

  const duplicateGroup = (groupId: string) => {
    const group = orderGroups.find((g) => g.id === groupId);
    if (!group) return;

    const newGroup: OrderGroup = {
      ...group,
      id: `copy-${Date.now()}`,
      name: `${group.name} (Copy)`,
    };

    setOrderGroups((groups) => [...groups, newGroup]);
  };

  // Conversion process
  const executeConversion = async () => {
    setIsConverting(true);
    setConversionProgress(0);
    const results: ConversionResult[] = [];

    for (let i = 0; i < orderGroups.length; i++) {
      const group = orderGroups[i];

      try {
        // Simulate API call to create order
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const orderNumber = `ORD-${Date.now()}-${i + 1}`;

        results.push({
          orderId: `order-${Date.now()}-${i}`,
          orderNumber,
          status: "success",
        });

        console.log("Created order:", {
          groupName: group.name,
          items: group.items,
          settings: {
            ...globalSettings,
            urgencyLevel: group.urgencyLevel,
            expectedProductionDays: group.expectedProductionDays,
            designApprovalRequired: group.designApprovalRequired,
            specialInstructions: group.specialInstructions,
          },
        });
      } catch (error) {
        results.push({
          orderId: "",
          orderNumber: "",
          status: "failed",
          error: "Failed to create order",
        });
      }

      setConversionProgress(((i + 1) / orderGroups.length) * 100);
    }

    setConversionResults(results);
    setIsConverting(false);

    if (onConversionComplete) {
      onConversionComplete(results);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "EMERGENCY":
        return "text-red-600 bg-red-50";
      case "RUSH":
        return "text-orange-600 bg-orange-50";
      case "EXPEDITED":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  const totalEstimatedValue = orderGroups.reduce(
    (sum, group) => sum + group.estimatedValue,
    0
  );
  const totalItems = orderGroups.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Convert Quote to Orders
          </h1>
          <p className="text-muted-foreground">
            Quote {bulkOrder.quoteNumber} • {bulkOrder.customerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}

          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepNumber
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNumber}
                </div>
                <p className="text-xs mt-2 text-center">
                  {stepNumber === 1 && "Strategy"}
                  {stepNumber === 2 && "Configure"}
                  {stepNumber === 3 && "Review"}
                  {stepNumber === 4 && "Convert"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Choose Strategy */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Conversion Strategy</CardTitle>
              <CardDescription>
                Select how you want to convert this quote into orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    strategy === "separate"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleStrategyChange("separate")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Split className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Separate Orders</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create one order for each item type. Best for different
                    production timelines.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Will create: {bulkOrder.items.length} orders
                  </div>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    strategy === "combined"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleStrategyChange("combined")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Combine className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Combined Order</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create single order with all items. Best for coordinated
                    delivery.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Will create: 1 order
                  </div>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    strategy === "custom"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleStrategyChange("custom")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Custom Grouping</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create custom groups based on your requirements. Full
                    control.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Will create: Custom groups
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!strategy}>
                  Next: Configure Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configure Orders */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Global Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Global Order Settings</CardTitle>
                <CardDescription>
                  These settings will apply to all orders unless overridden
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="urgencyLevel">Default Urgency Level</Label>
                    <Select
                      value={globalSettings.urgencyLevel}
                      onValueChange={(value) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          urgencyLevel: value as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="EXPEDITED">Expedited</SelectItem>
                        <SelectItem value="RUSH">Rush</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="productionDays">
                      Expected Production Days
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={globalSettings.expectedProductionDays}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          expectedProductionDays: parseInt(e.target.value) || 5,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={globalSettings.paymentMethod}
                      onValueChange={(value) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          paymentMethod: value as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MPESA">M-PESA</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="shippingAddress">Shipping Address</Label>
                    <Select
                      value={globalSettings.shippingAddressId}
                      onValueChange={(value) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          shippingAddressId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="addr-1">
                          Customer Default Address
                        </SelectItem>
                        <SelectItem value="addr-2">Billing Address</SelectItem>
                        <SelectItem value="addr-3">
                          Alternative Address
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="designApproval">
                      Design Approval Required
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Customer must approve designs before production
                    </p>
                  </div>
                  <Switch
                    id="designApproval"
                    checked={globalSettings.designApprovalRequired}
                    onCheckedChange={(checked) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        designApprovalRequired: checked,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={globalSettings.specialInstructions}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        specialInstructions: e.target.value,
                      }))
                    }
                    placeholder="Any special instructions for all orders..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Groups Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order Groups ({orderGroups.length})</CardTitle>
                    <CardDescription>
                      Configure individual order groups
                    </CardDescription>
                  </div>

                  {strategy === "custom" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newGroup: OrderGroup = {
                            id: `new-${Date.now()}`,
                            name: `New Group ${orderGroups.length + 1}`,
                            items: [],
                            urgencyLevel: "NORMAL",
                            expectedProductionDays: 5,
                            designApprovalRequired: true,
                            specialInstructions: "",
                            estimatedValue: 0,
                          };
                          setOrderGroups([...orderGroups, newGroup]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Group
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderGroups.map((group, index) => (
                    <Card key={group.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={group.name}
                                  onChange={(e) =>
                                    updateGroup(group.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  className="font-medium"
                                />
                                <Badge
                                  className={getUrgencyColor(
                                    group.urgencyLevel
                                  )}
                                >
                                  {group.urgencyLevel}
                                </Badge>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                {group.items.length} items • $
                                {group.estimatedValue.toFixed(2)}
                              </div>
                            </div>

                            {strategy === "custom" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateGroup(group.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => splitGroup(group.id)}
                                  disabled={group.items.length <= 1}
                                >
                                  <Split className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeGroup(group.id)}
                                  disabled={orderGroups.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <Label className="text-xs">Urgency Level</Label>
                              <Select
                                value={group.urgencyLevel}
                                onValueChange={(value) =>
                                  updateGroup(group.id, {
                                    urgencyLevel: value as any,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8">
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
                            </div>

                            <div>
                              <Label className="text-xs">Production Days</Label>
                              <Input
                                type="number"
                                min="1"
                                max="30"
                                value={group.expectedProductionDays}
                                onChange={(e) =>
                                  updateGroup(group.id, {
                                    expectedProductionDays:
                                      parseInt(e.target.value) || 5,
                                  })
                                }
                                className="h-8"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`approval-${group.id}`}
                                checked={group.designApprovalRequired}
                                onCheckedChange={(checked) =>
                                  updateGroup(group.id, {
                                    designApprovalRequired: checked as boolean,
                                  })
                                }
                              />
                              <Label
                                htmlFor={`approval-${group.id}`}
                                className="text-xs"
                              >
                                Design Approval
                              </Label>
                            </div>
                          </div>

                          {group.specialInstructions !==
                            globalSettings.specialInstructions && (
                            <div>
                              <Label className="text-xs">
                                Special Instructions
                              </Label>
                              <Textarea
                                value={group.specialInstructions}
                                onChange={(e) =>
                                  updateGroup(group.id, {
                                    specialInstructions: e.target.value,
                                  })
                                }
                                placeholder="Order-specific instructions..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          )}

                          {/* Items in this group */}
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">
                              ITEMS IN THIS ORDER
                            </Label>
                            <div className="mt-1 space-y-1">
                              {group.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span>{item.productName}</span>
                                  <span>
                                    {item.quantity} × $
                                    {item.unitPrice.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Previous
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={orderGroups.length === 0}
              >
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Summary</CardTitle>
                <CardDescription>
                  Review the orders that will be created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{orderGroups.length}</p>
                    <p className="text-sm text-muted-foreground">
                      Orders to Create
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalItems}</p>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ${totalEstimatedValue.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {
                        orderGroups.filter((g) => g.urgencyLevel !== "NORMAL")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Priority Orders
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {orderGroups.map((group, index) => (
                    <Card key={group.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                Order {index + 1}: {group.name}
                              </h4>
                              <Badge
                                className={getUrgencyColor(group.urgencyLevel)}
                              >
                                {group.urgencyLevel}
                              </Badge>
                              {group.designApprovalRequired && (
                                <Badge variant="outline">Design Approval</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {group.items.length} items •{" "}
                              {group.expectedProductionDays} production days
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              ${group.estimatedValue.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Est. delivery:{" "}
                              {format(
                                new Date(
                                  Date.now() +
                                    group.expectedProductionDays *
                                      24 *
                                      60 *
                                      60 *
                                      1000
                                ),
                                "MMM dd"
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Once conversion starts, this action
                cannot be undone. The quote status will be updated to
                &quot;CONVERTED&quot; and individual orders will be created for
                processing.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Previous
              </Button>
              <Button onClick={() => setStep(4)}>Start Conversion</Button>
            </div>
          </div>
        )}

        {/* Step 4: Convert */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Converting Quote to Orders</CardTitle>
              <CardDescription>
                {isConverting
                  ? "Creating orders... Please wait."
                  : conversionResults.length > 0
                    ? "Conversion completed!"
                    : "Ready to start conversion"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConverting && conversionResults.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Ready to Convert
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click the button below to start creating{" "}
                    {orderGroups.length} orders
                  </p>
                  <Button onClick={executeConversion} size="lg">
                    <Zap className="h-4 w-4 mr-2" />
                    Convert to Orders
                  </Button>
                </div>
              )}

              {isConverting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 font-medium">Creating orders...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>

                  <Progress value={conversionProgress} className="h-2" />

                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(conversionProgress)}% complete
                  </div>
                </div>
              )}

              {conversionResults.length > 0 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Conversion Complete!
                    </h3>
                    <p className="text-muted-foreground">
                      Successfully created{" "}
                      {
                        conversionResults.filter((r) => r.status === "success")
                          .length
                      }{" "}
                      orders
                    </p>
                  </div>

                  <div className="space-y-2">
                    {conversionResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          result.status === "success"
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.status === "success"
                              ? `Order ${result.orderNumber} created`
                              : `Failed to create order ${index + 1}`}
                          </span>
                        </div>

                        {result.status === "success" && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/dashboard/admin/orders/${result.orderId}`}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button asChild>
                      <Link href="/dashboard/admin/orders">
                        View All Orders
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

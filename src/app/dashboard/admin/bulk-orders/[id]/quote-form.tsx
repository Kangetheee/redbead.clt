/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Minus,
  Calculator,
  Save,
  Send,
  FileText,
  DollarSign,
  Package,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Schema for bulk quote form
const quoteItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  specifications: z.record(z.string()).optional(),
});

const bulkQuoteSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(1, "Phone number is required"),
  description: z.string().min(1, "Quote description is required"),
  items: z.array(quoteItemSchema).min(1, "At least one item is required"),
  validityPeriod: z.number().min(1, "Validity period must be at least 1 day"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  deliveryTerms: z.string().min(1, "Delivery terms are required"),
  notes: z.string().optional(),
  terms: z.string().min(1, "Terms and conditions are required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  taxRate: z.number().min(0).max(100),
  discountAmount: z.number().min(0).optional(),
  estimatedDelivery: z.string().optional(),
});

type BulkQuoteFormData = z.infer<typeof bulkQuoteSchema>;

interface QuoteFormProps {
  initialData?: Partial<BulkQuoteFormData>;
  onSave?: (data: BulkQuoteFormData) => void;
  onSend?: (data: BulkQuoteFormData) => void;
  isEditing?: boolean;
}

export default function QuoteForm({
  initialData,
  onSave,
  onSend,
  isEditing = false,
}: QuoteFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkQuoteFormData>({
    resolver: zodResolver(bulkQuoteSchema),
    defaultValues: {
      customerName: "",
      customerId: "",
      customerEmail: "",
      customerPhone: "",
      description: "",
      items: [
        {
          productName: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          specifications: {},
        },
      ],
      validityPeriod: 30,
      paymentTerms: "50% advance, 50% on delivery",
      deliveryTerms:
        "Free delivery within Nairobi. Charges apply for upcountry delivery.",
      notes: "",
      terms:
        "All prices are valid for the specified period. 50% deposit required upon approval.",
      priority: "MEDIUM",
      taxRate: 16,
      discountAmount: 0,
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedValues = watch();
  const watchedItems = watch("items");

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = watchedItems.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice || 0),
      0
    );
    const taxAmount = (subtotal * (watchedValues.taxRate || 0)) / 100;
    const discountAmount = watchedValues.discountAmount || 0;
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      total,
    };
  };

  const totals = calculateTotals();

  const addItem = () => {
    append({
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      specifications: {},
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleCalculatePricing = async () => {
    setIsCalculating(true);
    // Simulate pricing calculation
    setTimeout(() => {
      setIsCalculating(false);
    }, 2000);
  };

  const handleSaveQuote = async (data: BulkQuoteFormData) => {
    setIsSaving(true);
    try {
      onSave?.(data);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendQuote = async (data: BulkQuoteFormData) => {
    setIsSending(true);
    try {
      onSend?.(data);
    } finally {
      setIsSending(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <form className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditing ? "Edit Bulk Quote" : "Create Bulk Quote"}
            </CardTitle>
            <CardDescription>
              Create detailed quotes for large volume orders and corporate
              accounts
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  placeholder="Company or individual name"
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID *</Label>
                <Input
                  id="customerId"
                  {...register("customerId")}
                  placeholder="CUST-001"
                />
                {errors.customerId && (
                  <p className="text-sm text-red-500">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail")}
                  placeholder="contact@company.com"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  {...register("customerPhone")}
                  placeholder="+254 700 123 456"
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Quote Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of the bulk order requirements..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quote Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Quote Items ({fields.length})
                </CardTitle>
                <CardDescription>
                  Add products and services to include in this quote
                </CardDescription>
              </div>
              <Button type="button" onClick={addItem} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Name *</Label>
                      <Input
                        {...register(`items.${index}.productName`)}
                        placeholder="e.g., Custom T-Shirts"
                      />
                      {errors.items?.[index]?.productName && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.productName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="Detailed item description"
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        placeholder="100"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price ($) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                        placeholder="12.50"
                      />
                      {errors.items?.[index]?.unitPrice && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Item Total:</span>
                    <span className="text-lg font-bold">
                      $
                      {(
                        (watchedItems[index]?.quantity || 0) *
                        (watchedItems[index]?.unitPrice || 0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <Label>Specifications (Optional)</Label>
                    <Textarea
                      placeholder="Material, colors, sizes, printing details, etc..."
                      rows={2}
                      onChange={(e) => {
                        const specs = e.target.value.split("\n").reduce(
                          (acc, line) => {
                            const [key, ...valueParts] = line.split(":");
                            if (key && valueParts.length) {
                              acc[key.trim()] = valueParts.join(":").trim();
                            }
                            return acc;
                          },
                          {} as Record<string, string>
                        );
                        setValue(`items.${index}.specifications`, specs);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No items added</h3>
                <p className="text-muted-foreground mb-4">
                  Add at least one item to create a quote
                </p>
                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Summary
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={handleCalculatePricing}
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>Calculating...</>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Recalculate
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("taxRate", { valueAsNumber: true })}
                  placeholder="16"
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Amount ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("discountAmount", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select
                  value={watchedValues.priority}
                  onValueChange={(value) => setValue("priority", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({watchedValues.taxRate}%):</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(watchedValues.priority)}>
                {watchedValues.priority} Priority
              </Badge>
              <span className="text-sm text-muted-foreground">
                Total Items: {fields.length} • Total Quantity:{" "}
                {watchedItems.reduce(
                  (sum, item) => sum + (item.quantity || 0),
                  0
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validity Period (Days) *</Label>
                <Input
                  type="number"
                  min="1"
                  {...register("validityPeriod", { valueAsNumber: true })}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label>Estimated Delivery</Label>
                <Input type="date" {...register("estimatedDelivery")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Terms *</Label>
              <Textarea
                {...register("paymentTerms")}
                placeholder="e.g., 50% advance, 50% on delivery"
                rows={2}
              />
              {errors.paymentTerms && (
                <p className="text-sm text-red-500">
                  {errors.paymentTerms.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Delivery Terms *</Label>
              <Textarea
                {...register("deliveryTerms")}
                placeholder="e.g., Free delivery within Nairobi. Charges apply for upcountry delivery."
                rows={2}
              />
              {errors.deliveryTerms && (
                <p className="text-sm text-red-500">
                  {errors.deliveryTerms.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>General Terms & Conditions *</Label>
              <Textarea
                {...register("terms")}
                placeholder="Standard terms and conditions for this quote..."
                rows={4}
              />
              {errors.terms && (
                <p className="text-sm text-red-500">{errors.terms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Special Notes</Label>
              <Textarea
                {...register("notes")}
                placeholder="Any special requirements, phased delivery, etc..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Quote Total: ${totals.total.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Valid for {watchedValues.validityPeriod} days •{" "}
                  {fields.length} items
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Quote Preview</DialogTitle>
                      <DialogDescription>
                        Preview how the quote will appear to the customer
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-semibold">Quote Summary</h3>
                        <p>Customer: {watchedValues.customerName}</p>
                        <p>Total: ${totals.total.toFixed(2)}</p>
                        <p>Items: {fields.length}</p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setPreviewDialog(false)}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit(handleSaveQuote)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleSubmit(handleSendQuote)}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Quote
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

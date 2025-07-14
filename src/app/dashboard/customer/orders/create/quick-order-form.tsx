/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Upload,
  FileText,
  CreditCard,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Calculator,
  Star,
  Plus,
  Minus,
  Image as ImageIcon,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { useCreateOrder } from "@/hooks/use-orders";

// Quick order schema - simplified version
const quickOrderSchema = z.object({
  productType: z.string().min(1, "Please select a product type"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  description: z
    .string()
    .min(10, "Please provide a description (minimum 10 characters)"),
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
  designFiles: z.array(z.any()).optional(),
  specialRequirements: z.string().optional(),
  contactPhone: z.string().optional(),
  preferredDeliveryDate: z.string().optional(),
});

type QuickOrderFormData = z.infer<typeof quickOrderSchema>;

interface CustomerQuickOrderFormProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

// Popular product types
const PRODUCT_TYPES = [
  {
    id: "business-cards",
    name: "Business Cards",
    description: "Professional business cards",
    basePrice: 25,
    icon: FileText,
    popular: true,
  },
  {
    id: "flyers",
    name: "Flyers",
    description: "Promotional flyers and leaflets",
    basePrice: 15,
    icon: FileText,
    popular: true,
  },
  {
    id: "banners",
    name: "Banners",
    description: "Large format banners and signs",
    basePrice: 80,
    icon: Package,
    popular: false,
  },
  {
    id: "brochures",
    name: "Brochures",
    description: "Tri-fold and bi-fold brochures",
    basePrice: 35,
    icon: FileText,
    popular: true,
  },
  {
    id: "posters",
    name: "Posters",
    description: "Marketing and event posters",
    basePrice: 20,
    icon: ImageIcon,
    popular: false,
  },
  {
    id: "custom",
    name: "Custom Project",
    description: "Tell us what you need",
    basePrice: 50,
    icon: Star,
    popular: false,
  },
];

const URGENCY_OPTIONS = [
  {
    value: "NORMAL",
    label: "Standard (5-7 days)",
    multiplier: 1,
    icon: Clock,
    description: "Our regular processing time",
  },
  {
    value: "EXPEDITED",
    label: "Expedited (3-4 days)",
    multiplier: 1.5,
    icon: Zap,
    description: "Faster processing for urgent needs",
  },
  {
    value: "RUSH",
    label: "Rush (1-2 days)",
    multiplier: 2,
    icon: Zap,
    description: "Priority processing",
  },
  {
    value: "EMERGENCY",
    label: "Emergency (Same day)",
    multiplier: 3,
    icon: AlertTriangle,
    description: "Same-day completion when possible",
  },
];

export default function CustomerQuickOrderForm({
  onSuccess,
  onCancel,
}: CustomerQuickOrderFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuickOrderFormData>({
    resolver: zodResolver(quickOrderSchema),
    defaultValues: {
      quantity: 100,
      urgencyLevel: "NORMAL",
    },
  });

  const watchedValues = watch();
  const selectedProduct = PRODUCT_TYPES.find(
    (p) => p.id === watchedValues.productType
  );
  const selectedUrgency = URGENCY_OPTIONS.find(
    (u) => u.value === watchedValues.urgencyLevel
  );

  // Calculate estimated price
  const estimatedPrice =
    selectedProduct && watchedValues.quantity
      ? selectedProduct.basePrice *
        (watchedValues.quantity / 100) *
        (selectedUrgency?.multiplier || 1)
      : 0;

  const progressSteps = [
    { id: 1, title: "Product Details", icon: Package },
    { id: 2, title: "Upload Files", icon: Upload },
    { id: 3, title: "Review & Submit", icon: CheckCircle },
  ];

  const onSubmit = async (data: QuickOrderFormData) => {
    setIsSubmitting(true);

    try {
      // Convert to the format expected by CreateOrderDto
      const orderData = {
        items: [
          {
            productId: data.productType,
            quantity: data.quantity,
            customizations: {
              description: data.description,
              specialRequirements: data.specialRequirements,
              files: uploadedFiles.map((f) => f.name), // In real app, upload files first
            },
          },
        ],
        urgencyLevel: data.urgencyLevel,
        specialInstructions: data.specialRequirements,
        designApprovalRequired: true,
        shippingAddressId: "default", // Use customer's default address
        paymentMethod: "MPESA",
        customerPhone: data.contactPhone || "",
        expectedProductionDays:
          selectedUrgency?.value === "EMERGENCY"
            ? 1
            : selectedUrgency?.value === "RUSH"
              ? 2
              : selectedUrgency?.value === "EXPEDITED"
                ? 4
                : 7,
        notes: `Quick order created. Preferred delivery: ${data.preferredDeliveryDate || "As soon as possible"}`,
        useCartItems: false,
      };

      const result = await createOrder.mutateAsync(orderData);

      if (result.success && result.data) {
        onSuccess?.(result.data.id);
        router.push(`/dashboard/customer/orders/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create quick order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return (
          watchedValues.productType &&
          watchedValues.quantity &&
          watchedValues.description
        );
      case 3:
        return true; // Files are optional
      default:
        return true;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        isActive
                          ? "bg-blue-100"
                          : isCompleted
                            ? "bg-green-100"
                            : "bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>

                  {index < progressSteps.length - 1 && (
                    <div className="w-16 h-px bg-border mx-4" />
                  )}
                </div>
              );
            })}
          </div>

          <Progress
            value={(currentStep / progressSteps.length) * 100}
            className="h-2"
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Product Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What would you like to print?</CardTitle>
                <CardDescription>
                  Select your product type and provide details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Type Selection */}
                <div className="space-y-3">
                  <Label>Product Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PRODUCT_TYPES.map((product) => {
                      const Icon = product.icon;
                      const isSelected =
                        watchedValues.productType === product.id;

                      return (
                        <div
                          key={product.id}
                          className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setValue("productType", product.id)}
                        >
                          {product.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">
                              Popular
                            </Badge>
                          )}

                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {product.description}
                              </p>
                              <p className="text-sm font-medium text-blue-600 mt-1">
                                From ${product.basePrice}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.productType && (
                    <p className="text-sm text-red-500">
                      {errors.productType.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setValue(
                          "quantity",
                          Math.max(1, watchedValues.quantity - 50)
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <Input
                      type="number"
                      min="1"
                      step="50"
                      {...register("quantity", { valueAsNumber: true })}
                      className="text-center w-24"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setValue("quantity", watchedValues.quantity + 50)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Higher quantities = better unit price
                      </p>
                    </div>
                  </div>
                  {errors.quantity && (
                    <p className="text-sm text-red-500">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Tell us about your project. What text, images, or design elements do you need? Any specific colors or branding requirements?"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Urgency Level */}
                <div className="space-y-3">
                  <Label>Delivery Timeline</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {URGENCY_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected =
                        watchedValues.urgencyLevel === option.value;

                      return (
                        <div
                          key={option.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setValue("urgencyLevel", option.value as any)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <Icon
                              className={`h-4 w-4 mt-0.5 ${
                                option.value === "EMERGENCY"
                                  ? "text-red-500"
                                  : option.value === "RUSH"
                                    ? "text-orange-500"
                                    : option.value === "EXPEDITED"
                                      ? "text-yellow-500"
                                      : "text-green-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {option.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {option.description}
                              </p>
                              {option.multiplier > 1 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  +{Math.round((option.multiplier - 1) * 100)}%
                                  rush charge
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Estimate */}
            {selectedProduct && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Estimated Price
                      </h3>
                      <p className="text-sm text-green-600">
                        {selectedProduct.name} × {watchedValues.quantity}
                        {selectedUrgency?.multiplier &&
                          selectedUrgency.multiplier > 1 &&
                          ` (${selectedUrgency.label})`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">
                        ${estimatedPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600">
                        ${(estimatedPrice / watchedValues.quantity).toFixed(2)}{" "}
                        per unit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: File Upload */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Design Files (Optional)</CardTitle>
              <CardDescription>
                Upload any logos, images, or design files you have. Our team can
                also create designs for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">Upload Files</h3>
                <p className="text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported: JPG, PNG, PDF, AI, PSD (Max 10MB each)
                </p>

                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.ai,.psd"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />

                <Button asChild className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label htmlFor="specialRequirements">
                  Special Requirements or Instructions
                </Label>
                <Textarea
                  {...register("specialRequirements")}
                  placeholder="Any specific printing requirements, paper types, finishes, or design preferences..."
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
                <Input
                  {...register("contactPhone")}
                  placeholder="+254..."
                  type="tel"
                />
                <p className="text-sm text-muted-foreground">
                  We may call to clarify details about your order
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
                <CardDescription>
                  Please review all details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Product Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Product:</span>
                        <span>{selectedProduct?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{watchedValues.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeline:</span>
                        <span>{selectedUrgency?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Files:</span>
                        <span>{uploadedFiles.length} uploaded</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Pricing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>
                          ${(selectedProduct?.basePrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity ({watchedValues.quantity}):</span>
                        <span>
                          $
                          {(
                            (selectedProduct?.basePrice || 0) *
                            (watchedValues.quantity / 100)
                          ).toFixed(2)}
                        </span>
                      </div>
                      {selectedUrgency?.multiplier &&
                        selectedUrgency.multiplier > 1 && (
                          <div className="flex justify-between">
                            <span>Rush Charge:</span>
                            <span>
                              $
                              {(
                                (estimatedPrice *
                                  (selectedUrgency.multiplier - 1)) /
                                selectedUrgency.multiplier
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Estimated Total:</span>
                        <span>${estimatedPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Project Description</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {watchedValues.description}
                  </p>
                </div>

                {watchedValues.specialRequirements && (
                  <div>
                    <h4 className="font-medium mb-2">Special Requirements</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {watchedValues.specialRequirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>What happens next?</strong> After you submit this order,
                our team will review your requirements and contact you within 2
                hours with a detailed quote and timeline. You&apos;ll then
                approve the design before we begin production.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}

            {currentStep === 1 && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToStep(currentStep + 1) || isSubmitting}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Submit Order
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

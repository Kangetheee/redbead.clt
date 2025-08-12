/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  X,
  Loader2,
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
import { toast } from "sonner";

import { useCreateOrder } from "@/hooks/use-orders";
import {
  CreateOrderDto,
  createOrderSchema,
  URGENCY_LEVELS,
} from "@/lib/orders/dto/orders.dto";

// Quick order schema extending the proper DTO structure
const quickOrderSchema = z.object({
  // Product selection
  templateId: z.string().min(1, "Please select a product type"),
  sizeVariantId: z.string().min(1, "Please select a size"),
  quantity: z.number().min(1, "Quantity must be at least 1"),

  // Order details
  description: z
    .string()
    .min(10, "Please provide a description (minimum 10 characters)"),
  urgencyLevel: z.enum(URGENCY_LEVELS).default("NORMAL"),

  // Optional fields
  specialInstructions: z.string().optional(),
  customerPhone: z.string().optional(),
  preferredDeliveryDate: z.string().optional(),

  // Shipping
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().optional(),

  // File uploads (stored as metadata for quick orders)
  uploadedFileNames: z.array(z.string()).optional(),

  // Quick order specific notes
  quickOrderNotes: z.string().optional(),
});

type QuickOrderFormData = z.infer<typeof quickOrderSchema>;

interface CustomerQuickOrderFormProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  userPhone?: string;
}

// Template configurations (these would typically come from an API)
const TEMPLATE_CONFIGS = [
  {
    id: "template_business_cards",
    name: "Business Cards",
    description: "Professional business cards",
    category: "cards",
    icon: FileText,
    popular: true,
    sizeVariants: [
      {
        id: "size_standard_bc",
        name: "Standard",
        displayName: '3.5" x 2"',
        basePrice: 25,
      },
      {
        id: "size_mini_bc",
        name: "Mini",
        displayName: '3" x 1.75"',
        basePrice: 20,
      },
      {
        id: "size_square_bc",
        name: "Square",
        displayName: '2.5" x 2.5"',
        basePrice: 30,
      },
    ],
  },
  {
    id: "template_flyers",
    name: "Flyers",
    description: "Promotional flyers and leaflets",
    category: "marketing",
    icon: FileText,
    popular: true,
    sizeVariants: [
      {
        id: "size_a4_flyer",
        name: "A4",
        displayName: '8.27" x 11.69"',
        basePrice: 15,
      },
      {
        id: "size_a5_flyer",
        name: "A5",
        displayName: '5.83" x 8.27"',
        basePrice: 12,
      },
      {
        id: "size_letter_flyer",
        name: "Letter",
        displayName: '8.5" x 11"',
        basePrice: 15,
      },
    ],
  },
  {
    id: "template_banners",
    name: "Banners",
    description: "Large format banners and signs",
    category: "signage",
    icon: Package,
    popular: false,
    sizeVariants: [
      {
        id: "size_small_banner",
        name: "Small",
        displayName: "2' x 4'",
        basePrice: 80,
      },
      {
        id: "size_medium_banner",
        name: "Medium",
        displayName: "3' x 6'",
        basePrice: 120,
      },
      {
        id: "size_large_banner",
        name: "Large",
        displayName: "4' x 8'",
        basePrice: 160,
      },
    ],
  },
  {
    id: "template_brochures",
    name: "Brochures",
    description: "Tri-fold and bi-fold brochures",
    category: "marketing",
    icon: FileText,
    popular: true,
    sizeVariants: [
      {
        id: "size_trifold_brochure",
        name: "Tri-fold",
        displayName: '8.5" x 11" (tri-fold)',
        basePrice: 35,
      },
      {
        id: "size_bifold_brochure",
        name: "Bi-fold",
        displayName: '8.5" x 11" (bi-fold)',
        basePrice: 30,
      },
      {
        id: "size_z_fold_brochure",
        name: "Z-fold",
        displayName: '8.5" x 11" (z-fold)',
        basePrice: 35,
      },
    ],
  },
  {
    id: "template_posters",
    name: "Posters",
    description: "Marketing and event posters",
    category: "marketing",
    icon: ImageIcon,
    popular: false,
    sizeVariants: [
      {
        id: "size_a3_poster",
        name: "A3",
        displayName: '11.69" x 16.54"',
        basePrice: 20,
      },
      {
        id: "size_a2_poster",
        name: "A2",
        displayName: '16.54" x 23.39"',
        basePrice: 30,
      },
      {
        id: "size_a1_poster",
        name: "A1",
        displayName: '23.39" x 33.11"',
        basePrice: 45,
      },
    ],
  },
  {
    id: "template_custom",
    name: "Custom Project",
    description: "Tell us what you need",
    category: "custom",
    icon: Star,
    popular: false,
    sizeVariants: [
      {
        id: "size_custom_small",
        name: "Small",
        displayName: "Custom small format",
        basePrice: 50,
      },
      {
        id: "size_custom_medium",
        name: "Medium",
        displayName: "Custom medium format",
        basePrice: 75,
      },
      {
        id: "size_custom_large",
        name: "Large",
        displayName: "Custom large format",
        basePrice: 100,
      },
    ],
  },
];

const URGENCY_CONFIG = {
  NORMAL: {
    label: "Standard (5-7 days)",
    multiplier: 1,
    icon: Clock,
    description: "Our regular processing time",
    color: "text-green-500",
  },
  EXPEDITED: {
    label: "Expedited (3-4 days)",
    multiplier: 1.5,
    icon: Zap,
    description: "Faster processing for urgent needs",
    color: "text-yellow-500",
  },
  RUSH: {
    label: "Rush (1-2 days)",
    multiplier: 2,
    icon: Zap,
    description: "Priority processing",
    color: "text-orange-500",
  },
  EMERGENCY: {
    label: "Emergency (Same day)",
    multiplier: 3,
    icon: AlertTriangle,
    description: "Same-day completion when possible",
    color: "text-red-500",
  },
} as const;

const PROGRESS_STEPS = [
  { id: 1, title: "Product Details", icon: Package },
  { id: 2, title: "Upload Files", icon: Upload },
  { id: 3, title: "Review & Submit", icon: CheckCircle },
];

export default function QuickOrderForm({
  onSuccess,
  onCancel,
  defaultShippingAddressId = "",
  defaultBillingAddressId,
  userPhone = "",
}: CustomerQuickOrderFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // FIXED: Use the mutation correctly
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

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
      shippingAddressId: defaultShippingAddressId,
      billingAddressId: defaultBillingAddressId,
      customerPhone: userPhone,
    },
  });

  const watchedValues = watch();
  const selectedTemplate = TEMPLATE_CONFIGS.find(
    (t) => t.id === watchedValues.templateId
  );
  const selectedSizeVariant = selectedTemplate?.sizeVariants.find(
    (s) => s.id === watchedValues.sizeVariantId
  );
  const selectedUrgency = URGENCY_CONFIG[watchedValues.urgencyLevel];

  // Calculate estimated price
  const basePrice = selectedSizeVariant?.basePrice || 0;
  const quantityMultiplier = Math.max(1, watchedValues.quantity / 100);
  const urgencyMultiplier = selectedUrgency.multiplier;
  const estimatedPrice = basePrice * quantityMultiplier * urgencyMultiplier;

  const onSubmit = async (data: QuickOrderFormData) => {
    try {
      if (!selectedSizeVariant || !selectedTemplate) {
        throw new Error("Please select a valid product and size");
      }

      const customizations: Record<string, string> = {
        description: data.description,
      };

      if (uploadedFiles.length > 0) {
        customizations.uploaded_files = JSON.stringify(
          uploadedFiles.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          }))
        );
      }

      // Add special requirements if provided
      if (data.specialInstructions) {
        customizations.special_requirements = data.specialInstructions;
      }

      // Calculate expected production days based on urgency
      const expectedProductionDays =
        data.urgencyLevel === "EMERGENCY"
          ? 1
          : data.urgencyLevel === "RUSH"
            ? 2
            : data.urgencyLevel === "EXPEDITED"
              ? 4
              : 7;

      // Combine all notes
      const combinedNotes = [
        `Quick order for ${selectedTemplate.name}`,
        data.quickOrderNotes,
        data.preferredDeliveryDate
          ? `Preferred delivery: ${data.preferredDeliveryDate}`
          : null,
        uploadedFiles.length > 0
          ? `${uploadedFiles.length} file(s) uploaded`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      // FIXED: Update the order item structure to match the expected schema
      const orderData: CreateOrderDto = {
        items: [
          {
            productId: data.templateId, // Use productId instead of templateId
            variantId: data.sizeVariantId, // Use variantId instead of sizeVariantId
            quantity: data.quantity,
            customizations, // Now this is Record<string, string>
          },
        ],
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        urgencyLevel: data.urgencyLevel,
        expectedProductionDays,
        specialInstructions: data.specialInstructions,
        designApprovalRequired: true, // Always require approval for quick orders
        paymentMethod: "MPESA", // Default payment method
        customerPhone: data.customerPhone,
        notes: combinedNotes,
        useCartItems: false,
        templateId: data.templateId, // Set template at order level for quick orders
      };

      // Use the mutation correctly - it returns OrderResponse directly
      createOrder(orderData, {
        onSuccess: (orderResponse) => {
          // orderResponse is already the OrderResponse object
          toast.success("Quick order submitted successfully!");
          onSuccess?.(orderResponse.id);
          router.push(`/orders/${orderResponse.id}`);
        },
        onError: (error: any) => {
          console.error("Failed to create quick order:", error);
          toast.error(error?.message || "Failed to create quick order");
        },
      });
    } catch (error: any) {
      console.error("Failed to create quick order:", error);
      toast.error(error?.message || "Failed to create quick order");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Update form data with file names
    const allFileNames = [...uploadedFiles, ...validFiles].map((f) => f.name);
    setValue("uploadedFileNames", allFileNames);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setValue(
      "uploadedFileNames",
      newFiles.map((f) => f.name)
    );
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return !!(
          watchedValues.templateId &&
          watchedValues.sizeVariantId &&
          watchedValues.quantity &&
          watchedValues.description &&
          watchedValues.shippingAddressId
        );
      case 3:
        return true; // Files are optional
      default:
        return true;
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setValue("templateId", templateId);
    // Reset size variant when template changes
    setValue("sizeVariantId", "");
  };

  const handleSizeVariantSelect = (sizeVariantId: string) => {
    setValue("sizeVariantId", sizeVariantId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {PROGRESS_STEPS.map((step, index) => {
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

                  {index < PROGRESS_STEPS.length - 1 && (
                    <div className="w-16 h-px bg-border mx-4" />
                  )}
                </div>
              );
            })}
          </div>

          <Progress
            value={(currentStep / PROGRESS_STEPS.length) * 100}
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
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label>Product Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TEMPLATE_CONFIGS.map((template) => {
                      const Icon = template.icon;
                      const isSelected =
                        watchedValues.templateId === template.id;

                      return (
                        <div
                          key={template.id}
                          className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          {template.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">
                              Popular
                            </Badge>
                          )}

                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h3 className="font-medium">{template.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                              <p className="text-sm font-medium text-blue-600 mt-1">
                                From $
                                {Math.min(
                                  ...template.sizeVariants.map(
                                    (s) => s.basePrice
                                  )
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.templateId && (
                    <p className="text-sm text-red-500">
                      {errors.templateId.message}
                    </p>
                  )}
                </div>

                {/* Size Variant Selection */}
                {selectedTemplate && (
                  <div className="space-y-3">
                    <Label>Size Options</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedTemplate.sizeVariants.map((variant) => {
                        const isSelected =
                          watchedValues.sizeVariantId === variant.id;

                        return (
                          <div
                            key={variant.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleSizeVariantSelect(variant.id)}
                          >
                            <div className="text-center">
                              <h4 className="font-medium">{variant.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {variant.displayName}
                              </p>
                              <p className="text-sm font-medium text-blue-600 mt-1">
                                ${variant.basePrice}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.sizeVariantId && (
                      <p className="text-sm text-red-500">
                        {errors.sizeVariantId.message}
                      </p>
                    )}
                  </div>
                )}

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
                          Math.max(1, (watchedValues.quantity || 1) - 50)
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
                        setValue("quantity", (watchedValues.quantity || 1) + 50)
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
                    {URGENCY_LEVELS.map((level) => {
                      const config = URGENCY_CONFIG[level];
                      const Icon = config.icon;
                      const isSelected = watchedValues.urgencyLevel === level;

                      return (
                        <div
                          key={level}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setValue("urgencyLevel", level)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon
                              className={`h-4 w-4 mt-0.5 ${config.color}`}
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {config.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {config.description}
                              </p>
                              {config.multiplier > 1 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  +{Math.round((config.multiplier - 1) * 100)}%
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

                {/* Shipping Address */}
                <div className="space-y-2">
                  <Label htmlFor="shippingAddressId">Shipping Address</Label>
                  <Select
                    value={watchedValues.shippingAddressId}
                    onValueChange={(value) =>
                      setValue("shippingAddressId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping address" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={defaultShippingAddressId}>
                        Default Address
                      </SelectItem>
                      {/* Add other addresses from user context */}
                    </SelectContent>
                  </Select>
                  {errors.shippingAddressId && (
                    <p className="text-sm text-red-500">
                      {errors.shippingAddressId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Estimate */}
            {selectedTemplate && selectedSizeVariant && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Estimated Price
                      </h3>
                      <p className="text-sm text-green-600">
                        {selectedTemplate.name} × {watchedValues.quantity}
                        {selectedUrgency.multiplier > 1 &&
                          ` (${selectedUrgency.label})`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">
                        ${estimatedPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600">
                        $
                        {(
                          estimatedPrice / (watchedValues.quantity || 1)
                        ).toFixed(2)}{" "}
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
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Requirements or Instructions
                </Label>
                <Textarea
                  {...register("specialInstructions")}
                  placeholder="Any specific printing requirements, paper types, finishes, or design preferences..."
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  {...register("customerPhone")}
                  placeholder="+254..."
                  type="tel"
                />
                <p className="text-sm text-muted-foreground">
                  We may call to clarify details about your order
                </p>
              </div>

              {/* Preferred Delivery Date */}
              <div className="space-y-2">
                <Label htmlFor="preferredDeliveryDate">
                  Preferred Delivery Date (Optional)
                </Label>
                <Input
                  {...register("preferredDeliveryDate")}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Quick Order Notes */}
              <div className="space-y-2">
                <Label htmlFor="quickOrderNotes">Additional Notes</Label>
                <Textarea
                  {...register("quickOrderNotes")}
                  placeholder="Any additional information about your quick order..."
                  rows={2}
                />
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
                        <span>{selectedTemplate?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{selectedSizeVariant?.displayName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{watchedValues.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeline:</span>
                        <span>{selectedUrgency.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Files:</span>
                        <span>{uploadedFiles.length} uploaded</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Pricing Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>
                          ${selectedSizeVariant?.basePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity ({watchedValues.quantity}):</span>
                        <span>
                          ${(basePrice * quantityMultiplier).toFixed(2)}
                        </span>
                      </div>
                      {selectedUrgency.multiplier > 1 && (
                        <div className="flex justify-between">
                          <span>
                            Rush Charge (
                            {Math.round((selectedUrgency.multiplier - 1) * 100)}
                            %):
                          </span>
                          <span>
                            $
                            {(
                              basePrice *
                              quantityMultiplier *
                              (selectedUrgency.multiplier - 1)
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Estimated Total:</span>
                        <span>${estimatedPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Per unit:</span>
                        <span>
                          $
                          {(
                            estimatedPrice / (watchedValues.quantity || 1)
                          ).toFixed(2)}
                        </span>
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

                {watchedValues.specialInstructions && (
                  <div>
                    <h4 className="font-medium mb-2">Special Instructions</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {watchedValues.specialInstructions}
                    </p>
                  </div>
                )}

                {watchedValues.quickOrderNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {watchedValues.quickOrderNotes}
                    </p>
                  </div>
                )}

                {watchedValues.preferredDeliveryDate && (
                  <div>
                    <h4 className="font-medium mb-2">Preferred Delivery</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {new Date(
                        watchedValues.preferredDeliveryDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Uploaded Files</h4>
                    <div className="bg-muted p-3 rounded">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>{file.name}</span>
                          <span className="text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ))}
                    </div>
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

            {/* Terms and Conditions */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Important Notes
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>
                        • This is an estimate. Final pricing may vary based on
                        specifications.
                      </li>
                      <li>
                        • Design approval is required before production begins.
                      </li>
                      <li>
                        • Rush orders are subject to availability and may have
                        additional fees.
                      </li>
                      <li>
                        • Custom projects require detailed consultation before
                        final pricing.
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                disabled={isCreatingOrder}
              >
                Previous
              </Button>
            )}

            {currentStep === 1 && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isCreatingOrder}
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
                disabled={!canProceedToStep(currentStep + 1) || isCreatingOrder}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={
                  isCreatingOrder || !selectedTemplate || !selectedSizeVariant
                }
                className="min-w-[120px]"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>Please fix the following errors:</p>
                {Object.entries(errors).map(([key, error]) => (
                  <p key={key} className="text-xs">
                    • {error.message}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

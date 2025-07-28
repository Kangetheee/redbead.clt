/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Minus,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  FileText,
  AlertTriangle,
  Save,
  ArrowLeft,
  Loader2,
  Search,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useCreateOrder } from "@/hooks/use-orders";
import { useAddresses } from "@/hooks/use-address";
import {
  useDesignTemplates,
  useSizeVariants,
} from "@/hooks/use-design-templates";
import {
  CreateOrderDto,
  createOrderSchema,
  OrderItemDto,
  URGENCY_LEVELS,
} from "@/lib/orders/dto/orders.dto";

interface CreateOrderFormProps {
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
}

export default function CreateOrderForm({
  onSuccess,
  onCancel,
}: CreateOrderFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [templateSearch, setTemplateSearch] = useState("");

  const createOrder = useCreateOrder();

  // Fetch templates with search
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
  } = useDesignTemplates({
    search: templateSearch || undefined,
    isActive: true,
    limit: 50,
  });

  // Fetch addresses
  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
  } = useAddresses();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateOrderDto>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      urgencyLevel: "NORMAL",
      designApprovalRequired: true,
      paymentMethod: "MPESA",
      useCartItems: false,
      items: [
        {
          templateId: "",
          sizeVariantId: "",
          quantity: 1,
          customizations: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedValues = watch();

  // Size variants state management
  const [sizeVariantsByTemplate, setSizeVariantsByTemplate] = useState<
    Record<string, any[]>
  >({});
  const [loadingSizeVariants, setLoadingSizeVariants] = useState<
    Record<string, boolean>
  >({});

  // Function to fetch size variants for a template
  const fetchSizeVariants = async (templateId: string) => {
    if (!templateId || sizeVariantsByTemplate[templateId]) return;

    setLoadingSizeVariants((prev) => ({ ...prev, [templateId]: true }));

    try {
      // We'll need to import the action directly
      const { getSizeVariantsAction } = await import(
        "@/lib/design-templates/design-templates.actions"
      );
      const result = await getSizeVariantsAction(templateId);

      if (result.success) {
        setSizeVariantsByTemplate((prev) => ({
          ...prev,
          [templateId]: result.data || [],
        }));
      }
    } catch (error) {
      console.error("Failed to fetch size variants:", error);
    } finally {
      setLoadingSizeVariants((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  // Effect to fetch size variants when template is selected
  useEffect(() => {
    const currentItems = getValues("items") || [];
    currentItems.forEach((item) => {
      if (item.templateId && !sizeVariantsByTemplate[item.templateId]) {
        fetchSizeVariants(item.templateId);
      }
    });
  }, [watchedValues.items, sizeVariantsByTemplate, getValues]);

  const onSubmit = async (data: CreateOrderDto) => {
    try {
      const result = await createOrder.mutateAsync(data);
      if (result.success && result.data) {
        onSuccess?.(result.data.id);
        router.push(`/orders/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const addItem = () => {
    append({
      templateId: "",
      sizeVariantId: "",
      quantity: 1,
      customizations: [],
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Fixed template selection handler
  const handleTemplateSelect = (index: number, templateId: string) => {
    // Update form values directly
    setValue(`items.${index}.templateId`, templateId);
    setValue(`items.${index}.sizeVariantId`, ""); // Reset size variant when template changes

    // Trigger form validation
    const items = getValues("items");
    items[index].templateId = templateId;
    items[index].sizeVariantId = "";
    setValue("items", items);

    // Fetch size variants for this template
    if (templateId && !sizeVariantsByTemplate[templateId]) {
      fetchSizeVariants(templateId);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return Package;
      case 2:
        return User;
      case 3:
        return MapPin;
      case 4:
        return CreditCard;
      default:
        return Package;
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return watchedValues.items?.every(
          (item) => item.templateId && item.sizeVariantId && item.quantity > 0
        );
      case 2:
        return true; // Customer info is optional for now
      case 3:
        return !!watchedValues.shippingAddressId;
      case 4:
        return !!watchedValues.paymentMethod;
      default:
        return false;
    }
  };

  const steps = [
    {
      number: 1,
      title: "Order Items",
      description: "Add products to the order",
    },
    {
      number: 2,
      title: "Customer Info",
      description: "Customer details and preferences",
    },
    {
      number: 3,
      title: "Shipping",
      description: "Delivery address and options",
    },
    {
      number: 4,
      title: "Payment",
      description: "Payment method and confirmation",
    },
  ];

  // Format address for display
  const formatAddress = (address: any) => {
    const parts = [
      address.street,
      address.street2,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Get template by ID for display
  const getTemplateById = (templateId: string) => {
    return templatesData?.success
      ? templatesData.data?.items.find((t) => t.id === templateId)
      : undefined;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Order
          </h1>
          <p className="text-muted-foreground">
            Set up a new order for your customer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onCancel?.() || router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((stepInfo, index) => {
              const Icon = getStepIcon(stepInfo.number);
              const isActive = step === stepInfo.number;
              const isCompleted = step > stepInfo.number;
              const isValid = isStepValid(stepInfo.number);

              return (
                <div
                  key={stepInfo.number}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted && isValid
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {stepInfo.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stepInfo.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-1/2 w-full h-0.5 bg-muted -z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Order Items - FIXED SECTION */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
              <CardDescription>
                Add products and specify quantities for this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Search */}
              <div className="space-y-2">
                <Label htmlFor="template-search">Search Templates</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="template-search"
                    placeholder="Search for templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {templatesError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load templates. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {fields.map((field, index) => {
                // Get current values for this item
                const currentItem = watchedValues.items?.[index] || field;
                const selectedTemplate = getTemplateById(
                  currentItem.templateId
                );
                const sizeVariants = currentItem.templateId
                  ? sizeVariantsByTemplate[currentItem.templateId] || []
                  : [];
                const isLoadingSizeVariants = currentItem.templateId
                  ? loadingSizeVariants[currentItem.templateId] || false
                  : false;

                return (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Item {index + 1}
                        {selectedTemplate && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedTemplate.name}
                          </Badge>
                        )}
                      </Label>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.templateId`}>
                          Template
                        </Label>
                        <Select
                          value={currentItem.templateId || ""}
                          onValueChange={(value) =>
                            handleTemplateSelect(index, value)
                          }
                          disabled={templatesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                templatesLoading
                                  ? "Loading templates..."
                                  : "Select template"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {templatesLoading ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading templates...
                                </div>
                              </SelectItem>
                            ) : templatesData?.success &&
                              templatesData.data?.items.length > 0 ? (
                              templatesData.data.items.map((template) => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      {template.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                                      {template.description}
                                    </span>
                                    <span className="text-sm text-green-600 font-medium">
                                      Base Price: ${template.basePrice}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-templates" disabled>
                                {templateSearch
                                  ? "No templates found for search"
                                  : "No templates available"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {errors.items?.[index]?.templateId && (
                          <p className="text-sm text-red-500">
                            Template is required
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.sizeVariantId`}>
                          Size Variant
                        </Label>
                        <Select
                          value={currentItem.sizeVariantId || ""}
                          onValueChange={(value) => {
                            setValue(`items.${index}.sizeVariantId`, value);
                          }}
                          disabled={
                            !currentItem.templateId || isLoadingSizeVariants
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !currentItem.templateId
                                  ? "Select template first"
                                  : isLoadingSizeVariants
                                    ? "Loading sizes..."
                                    : "Select size"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {!currentItem.templateId ? (
                              <SelectItem value="no-template" disabled>
                                Select a template first
                              </SelectItem>
                            ) : isLoadingSizeVariants ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading sizes...
                                </div>
                              </SelectItem>
                            ) : sizeVariants.length > 0 ? (
                              sizeVariants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      {variant.displayName}
                                    </span>
                                    {variant.dimensions && (
                                      <span className="text-sm text-muted-foreground">
                                        {variant.dimensions.width} x{" "}
                                        {variant.dimensions.height}{" "}
                                        {variant.dimensions.unit}
                                      </span>
                                    )}
                                    <span className="text-sm text-green-600 font-medium">
                                      Price: ${variant.price}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-variants" disabled>
                                No size variants available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {errors.items?.[index]?.sizeVariantId && (
                          <p className="text-sm text-red-500">
                            Size variant is required
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.quantity`}>
                          Quantity
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          placeholder="1"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="text-sm text-red-500">
                            {errors.items[index]?.quantity?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Customization Options</Label>
                      <Textarea
                        placeholder="Special requests, text, colors, customization details..."
                        rows={2}
                        onChange={(e) =>
                          setValue(`items.${index}.customizations`, [
                            {
                              optionId: "custom_text",
                              valueId: "text_value",
                              customValue: e.target.value,
                            },
                          ])
                        }
                      />
                    </div>

                    {/* Template Details */}
                    {selectedTemplate && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">SKU:</span>{" "}
                            {selectedTemplate.sku}
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span>{" "}
                            {selectedTemplate.stock}
                          </div>
                          <div>
                            <span className="font-medium">Min Qty:</span>{" "}
                            {selectedTemplate.minOrderQuantity}
                          </div>
                          <div>
                            <span className="font-medium">Lead Time:</span>{" "}
                            {selectedTemplate.leadTime}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Customer Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
              <CardDescription>
                Specify customer details and order preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID (Optional)</Label>
                  <Input
                    id="customerId"
                    {...register("customerId")}
                    placeholder="Leave empty to create guest order"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder="+254..."
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Order Preferences
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="urgencyLevel">Urgency Level</Label>
                    <Select
                      value={watchedValues.urgencyLevel}
                      onValueChange={(value) =>
                        setValue("urgencyLevel", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {URGENCY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0) + level.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedProductionDays">
                      Expected Production Days
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      {...register("expectedProductionDays", {
                        valueAsNumber: true,
                      })}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="designApprovalRequired">
                      Design Approval Required
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Customer must approve design before production
                    </p>
                  </div>
                  <Switch
                    id="designApprovalRequired"
                    checked={watchedValues.designApprovalRequired}
                    onCheckedChange={(checked) =>
                      setValue("designApprovalRequired", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  {...register("specialInstructions")}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Shipping */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>
                Select delivery address and shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddressId">Shipping Address</Label>
                <Select
                  value={watchedValues.shippingAddressId}
                  onValueChange={(value) =>
                    setValue("shippingAddressId", value)
                  }
                  disabled={addressesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        addressesLoading
                          ? "Loading addresses..."
                          : "Select shipping address"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {addressesLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading addresses...
                        </div>
                      </SelectItem>
                    ) : addressesError ? (
                      <SelectItem value="error" disabled>
                        Error loading addresses
                      </SelectItem>
                    ) : addressesData?.success &&
                      addressesData.data?.items.length > 0 ? (
                      addressesData.data.items.map((address: any) => (
                        <SelectItem key={address.id} value={address.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {address.name || address.recipientName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatAddress(address)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-addresses" disabled>
                        No addresses found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.shippingAddressId && (
                  <p className="text-sm text-red-500">
                    Shipping address is required
                  </p>
                )}
                {addressesError && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load addresses. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddressId">
                  Billing Address (Optional)
                </Label>
                <Select
                  value={watchedValues.billingAddressId || "same-as-shipping"}
                  onValueChange={(value) =>
                    setValue(
                      "billingAddressId",
                      value === "same-as-shipping" ? undefined : value
                    )
                  }
                  disabled={addressesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        addressesLoading
                          ? "Loading addresses..."
                          : "Same as shipping address"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same-as-shipping">
                      Same as shipping address
                    </SelectItem>
                    {addressesLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading addresses...
                        </div>
                      </SelectItem>
                    ) : addressesData?.success &&
                      addressesData.data?.items?.length > 0 ? (
                      addressesData.data.items.map((address: any) => (
                        <SelectItem key={address.id} value={address.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {address.name || address.recipientName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatAddress(address)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-addresses" disabled>
                        No addresses found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Select payment method and add any coupons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={watchedValues.paymentMethod}
                  onValueChange={(value) => setValue("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MPESA">M-PESA</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                <Input
                  id="couponCode"
                  {...register("couponCode")}
                  placeholder="Enter coupon code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Internal notes about this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(Math.min(4, step + 1))}
                disabled={!isStepValid(step)}
              >
                Next
                {!isStepValid(step) && (
                  <AlertTriangle className="h-4 w-4 ml-2" />
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createOrder.isPending || !isStepValid(step)}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Order
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
              Please fix the errors above before proceeding.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

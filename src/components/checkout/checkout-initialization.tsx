/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInitializeCheckout,
  useInitializeGuestCheckout,
} from "@/hooks/use-checkout";
import {
  initCheckoutSchema,
  guestInitCheckoutSchema,
  checkoutItemSchema,
  type InitCheckoutDto,
  type GuestInitCheckoutDto,
} from "@/lib/checkout/dto/checkout.dto";
// Create type from schema
type CheckoutItemDto = z.infer<typeof checkoutItemSchema>;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Tag,
  Package,
  Star,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Minus,
  Building,
  Shield,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";

interface CheckoutInitializationProps {
  cartItems?: CartItem[];
  defaultGuestEmail?: string;
  isGuest?: boolean;
  couponCode?: string;
  returnUrl?: string;
  onInitialized?: (sessionId: string) => void;
  className?: string;
}

interface CartItem {
  productId?: string;
  templateId?: string;
  productName?: string;
  templateName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations: any[];
  designId?: string;
  thumbnail?: string;
  sizeVariantId?: string;
  sizeVariantName?: string;
}

export function CheckoutInitialization({
  cartItems = [],
  defaultGuestEmail = "",
  isGuest = false,
  couponCode = "",
  returnUrl = "/dashboard/customer/cart",
  onInitialized,
  className,
}: CheckoutInitializationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [checkoutMode, setCheckoutMode] = useState<"cart" | "custom">("cart");
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<CheckoutItemDto[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  // Hooks
  const initializeCheckoutMutation = useInitializeCheckout();
  const initializeGuestCheckoutMutation = useInitializeGuestCheckout();

  // Forms
  const authenticatedForm = useForm<InitCheckoutDto>({
    resolver: zodResolver(initCheckoutSchema),
    defaultValues: {
      useCartItems: true,
      items: [],
      couponCode: couponCode || undefined,
    },
  });

  const guestForm = useForm<GuestInitCheckoutDto>({
    resolver: zodResolver(guestInitCheckoutSchema),
    defaultValues: {
      guestEmail: defaultGuestEmail,
      items: [],
      couponCode: couponCode || undefined,
    },
  });

  // Auto-select all cart items by default
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItems(cartItems.map((_, index) => index.toString()));
    }
  }, [cartItems]);

  // Convert cart item to checkout item format
  const convertToCheckoutItem = (item: CartItem): CheckoutItemDto => {
    const checkoutItem: CheckoutItemDto = {
      productId: item.productId || "",
      quantity: item.quantity,
      customizations: Array.isArray(item.customizations)
        ? item.customizations.map((custom) => ({
            optionId: custom.optionId || "unknown",
            valueId: custom.valueId || "unknown",
            customValue: custom.customValue,
          }))
        : [],
      designId: item.designId,
    };

    // Validate the item
    try {
      return checkoutItemSchema.parse(checkoutItem);
    } catch (error) {
      console.warn("Invalid checkout item:", error);
      return checkoutItem;
    }
  };

  // Get selected cart items
  const getSelectedCartItems = (): CheckoutItemDto[] => {
    return selectedItems
      .map((index) => cartItems[parseInt(index)])
      .filter(Boolean)
      .map(convertToCheckoutItem);
  };

  // Handle authenticated checkout initialization
  const handleAuthenticatedInit = async (data: InitCheckoutDto) => {
    setIsInitializing(true);

    try {
      let finalData = { ...data };

      if (checkoutMode === "cart") {
        finalData = {
          useCartItems: true,
          couponCode: data.couponCode,
        };
      } else {
        finalData = {
          useCartItems: false,
          items: customItems,
          couponCode: data.couponCode,
        };
      }

      const result = await initializeCheckoutMutation.mutateAsync(finalData);

      onInitialized?.(result.sessionId);

      // Navigate to checkout
      const checkoutUrl = new URL("/checkout", window.location.origin);
      checkoutUrl.searchParams.set("session", result.sessionId);

      router.push(checkoutUrl.toString());
    } catch (error) {
      console.error("Checkout initialization failed:", error);
      toast.error("Failed to initialize checkout. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle guest checkout initialization
  const handleGuestInit = async (data: GuestInitCheckoutDto) => {
    setIsInitializing(true);

    try {
      const finalData = { ...data };

      if (checkoutMode === "cart" && selectedItems.length > 0) {
        finalData.items = getSelectedCartItems();
      } else if (checkoutMode === "custom") {
        finalData.items = customItems;
      }

      if (finalData.items.length === 0) {
        toast.error("Please select at least one item for checkout");
        return;
      }

      const result =
        await initializeGuestCheckoutMutation.mutateAsync(finalData);

      onInitialized?.(result.sessionId);

      // Navigate to guest checkout
      const checkoutUrl = new URL("/checkout/guest", window.location.origin);
      checkoutUrl.searchParams.set("session", result.sessionId);

      router.push(checkoutUrl.toString());
    } catch (error) {
      console.error("Guest checkout initialization failed:", error);
      toast.error("Failed to initialize guest checkout. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleItemSelection = (index: string, selected: boolean) => {
    if (selected) {
      setSelectedItems((prev) => [...prev, index]);
    } else {
      setSelectedItems((prev) => prev.filter((i) => i !== index));
    }
  };

  const addCustomItem = () => {
    const newItem: CheckoutItemDto = {
      productId: "",
      quantity: 1,
      customizations: [],
    };
    setCustomItems((prev) => [...prev, newItem]);
  };

  const removeCustomItem = (index: number) => {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCustomItem = (
    index: number,
    updates: Partial<CheckoutItemDto>
  ) => {
    setCustomItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const getTotalAmount = () => {
    if (checkoutMode === "cart") {
      return selectedItems.reduce((total, index) => {
        const item = cartItems[parseInt(index)];
        return total + (item?.totalPrice || 0);
      }, 0);
    }
    return 0; // Custom items would need pricing logic
  };

  const getTotalQuantity = () => {
    if (checkoutMode === "cart") {
      return selectedItems.reduce((total, index) => {
        const item = cartItems[parseInt(index)];
        return total + (item?.quantity || 0);
      }, 0);
    }
    return customItems.reduce((total, item) => total + item.quantity, 0);
  };

  const canProceed = () => {
    if (checkoutMode === "cart") {
      return selectedItems.length > 0;
    }
    return (
      customItems.length > 0 &&
      customItems.every((item) => item.productId && item.quantity > 0)
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Initialize Checkout</h1>
        <p className="text-muted-foreground">
          {isGuest ? "Continue as guest" : "Prepare your order for checkout"}
        </p>
        {cartItems.length > 0 && (
          <Badge variant="secondary">{cartItems.length} items in cart</Badge>
        )}
      </div>

      {/* Mode Selection */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Checkout Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={checkoutMode === "cart" ? "default" : "outline"}
                onClick={() => setCheckoutMode("cart")}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Use Cart Items
              </Button>
              <Button
                variant={checkoutMode === "custom" ? "default" : "outline"}
                onClick={() => setCheckoutMode("custom")}
                className="flex-1"
              >
                <Package className="mr-2 h-4 w-4" />
                Custom Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Items Selection */}
      {checkoutMode === "cart" && cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Items ({selectedItems.length}/{cartItems.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowItemDetails(!showItemDetails)}
              >
                {showItemDetails ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === cartItems.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItems(
                        cartItems.map((_, index) => index.toString())
                      );
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All Items
                </Label>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: KES {getTotalAmount().toLocaleString()}
              </div>
            </div>

            <Separator />

            {/* Items List */}
            <div className="space-y-3">
              {cartItems.map((item, index) => {
                const isSelected = selectedItems.includes(index.toString());

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 p-3 border rounded-lg",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleItemSelection(index.toString(), !!checked)
                      }
                    />

                    <div className="w-12 h-12 rounded border overflow-hidden bg-background flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.productName || item.templateName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.productName || item.templateName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × KES{" "}
                        {item.unitPrice.toLocaleString()}
                      </div>

                      {showItemDetails && (
                        <div className="mt-2 space-y-1">
                          {item.sizeVariantName && (
                            <Badge variant="outline" className="text-xs">
                              {item.sizeVariantName}
                            </Badge>
                          )}
                          {item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.customizations
                                .slice(0, 2)
                                .map((custom, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {typeof custom === "string"
                                      ? custom
                                      : "Custom"}
                                  </Badge>
                                ))}
                              {item.customizations.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.customizations.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          {item.designId && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-2 w-2 mr-1" />
                              Custom Design
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-sm font-medium">
                      KES {item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Items */}
      {checkoutMode === "custom" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Custom Items ({customItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No custom items added yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customItems.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Item {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomItem(index)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`product-${index}`}>Product ID</Label>
                        <Input
                          id={`product-${index}`}
                          value={item.productId}
                          onChange={(e) =>
                            updateCustomItem(index, {
                              productId: e.target.value,
                            })
                          }
                          placeholder="Enter product ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCustomItem(index, {
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCustomItem(index, {
                                quantity: Math.max(
                                  1,
                                  parseInt(e.target.value) || 1
                                ),
                              })
                            }
                            className="text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCustomItem(index, {
                                quantity: item.quantity + 1,
                              })
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={addCustomItem}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isGuest ? (
              <Mail className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            {isGuest ? "Guest Information" : "Checkout Options"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGuest ? (
            <Form {...guestForm}>
              <form
                onSubmit={guestForm.handleSubmit(handleGuestInit)}
                className="space-y-4"
              >
                <FormField
                  control={guestForm.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          disabled={isInitializing}
                        />
                      </FormControl>
                      <FormDescription>
                        We&apos;ll send order updates to this email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={guestForm.control}
                  name="couponCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter coupon code"
                          {...field}
                          disabled={isInitializing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(returnUrl)}
                    disabled={isInitializing}
                  >
                    Back to Cart
                  </Button>

                  <Button
                    type="submit"
                    disabled={!canProceed() || isInitializing}
                    className="min-w-32"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        Continue as Guest
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...authenticatedForm}>
              <form
                onSubmit={authenticatedForm.handleSubmit(
                  handleAuthenticatedInit
                )}
                className="space-y-4"
              >
                <FormField
                  control={authenticatedForm.control}
                  name="couponCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter coupon code"
                          {...field}
                          disabled={isInitializing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(returnUrl)}
                    disabled={isInitializing}
                  >
                    Back to Cart
                  </Button>

                  <Button
                    type="submit"
                    disabled={!canProceed() || isInitializing}
                    className="min-w-32"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        Initialize Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {selectedItems.length > 0 || customItems.length > 0 ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {getTotalQuantity()} items selected
                </div>
                {checkoutMode === "cart" && (
                  <div className="text-sm text-muted-foreground">
                    Total: KES {getTotalAmount().toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Ready to checkout</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select at least one item to proceed with checkout.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">
                Secure Checkout Process
              </p>
              <p className="text-green-700 mt-1">
                Your information is protected with industry-standard SSL
                encryption. All payment processing is handled securely by our
                certified payment partners.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>PCI Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Instant Processing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

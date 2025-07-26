/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  X,
  Upload,
  Send,
  Clock,
  AlertTriangle,
  Package,
  User,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Import TanStack Query hooks
import {
  useEmailTemplates,
  usePreviewEmailTemplate,
  useSendEmail,
} from "@/hooks/use-communication";
import { EmailTemplateCategory } from "@/lib/communications/dto/email-template.dto";
import { SendEmailDto } from "@/lib/communications/dto/email-send.dto";

// Import Orders hook
import { useOrders } from "@/hooks/use-orders";
import { GetOrdersDto } from "@/lib/orders/dto/orders.dto";

interface PreviewImage {
  url: string;
  name: string;
  file?: File;
}

// Component for loading skeleton
function CreateApprovalSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CreateApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [priority, setPriority] = useState<"high" | "normal" | "low">("normal");

  // Query parameters for fetching orders
  const [ordersParams, setOrdersParams] = useState<GetOrdersDto>({
    page: 1,
    limit: 50,
    // Only fetch orders that might need approval
    status: "DESIGN_PENDING",
  });

  // TanStack Query hooks
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders(ordersParams);

  const { data: templatesData, isLoading: templatesLoading } =
    useEmailTemplates({
      category: "DESIGN_APPROVAL_REQUEST",
      isActive: true,
    });

  const previewEmailMutation = usePreviewEmailTemplate();
  const sendEmailMutation = useSendEmail();

  const templates = templatesData?.items || [];
  const orders = ordersResponse?.success
    ? ordersResponse.data?.items || []
    : [];

  // Get order ID from URL params
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        // Set default preview images from design files
        const designFiles =
          (order as any).designFiles || (order as any).attachments || [];
        const imageFiles =
          designFiles.filter((file: any) =>
            file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          ) || [];
        setPreviewImages(
          imageFiles.map((file: any) => ({ url: file.url, name: file.name }))
        );
      }
    }
  }, [searchParams, orders]);

  // Update search params when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setOrdersParams((prev) => ({
        ...prev,
        search: searchTerm || undefined,
        page: 1, // Reset to first page when searching
      }));
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter orders based on search (additional client-side filtering)
  const filteredOrders = orders.filter(
    (order: any) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    // Set default preview images from design files
    const imageFiles =
      order.designFiles?.filter((file: any) =>
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ) || [];
    setPreviewImages(
      imageFiles.map((file: any) => ({ url: file.url, name: file.name }))
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages((prev) => [
          ...prev,
          {
            url: e.target?.result as string,
            name: file.name,
            file: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = async () => {
    if (!selectedOrder || !selectedTemplateId) return;

    try {
      await previewEmailMutation.mutateAsync({
        templateId: selectedTemplateId,
        variables: {
          customerName: selectedOrder.customer?.name || "",
          orderNumber: selectedOrder.orderNumber,
          productName: selectedOrder.orderItems?.[0]?.productName || "",
          quantity: selectedOrder.orderItems?.[0]?.quantity || 0,
          totalAmount: selectedOrder.totalAmount?.toFixed(2) || "0.00",
        },
        deviceType: "desktop",
      });
    } catch (error) {
      console.error("Error previewing email:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedTemplateId || previewImages.length === 0)
      return;

    try {
      const emailData: SendEmailDto = {
        templateId: selectedTemplateId,
        recipientEmail: selectedOrder.customer?.email || "",
        recipientName: selectedOrder.customer?.name || "",
        variables: {
          customerName: selectedOrder.customer?.name || "",
          orderNumber: selectedOrder.orderNumber,
          productName: selectedOrder.orderItems?.[0]?.productName || "",
          quantity: selectedOrder.orderItems?.[0]?.quantity || 0,
          totalAmount: selectedOrder.totalAmount?.toFixed(2) || "0.00",
          customMessage: customMessage,
          // Add preview image URLs to variables
          previewImages: previewImages.map((img) => img.url),
        },
        orderId: selectedOrder.id,
        priority,
        tags: ["design-approval", "order-" + selectedOrder.orderNumber],
        trackOpens: true,
        trackClicks: true,
      };

      await sendEmailMutation.mutateAsync(emailData);

      // Redirect to approvals list with success message
      router.push(
        "/dashboard/admin/communication/approvals?success=approval-sent"
      );
    } catch (error) {
      console.error("Error sending approval:", error);
    }
  };

  const isSubmitting = sendEmailMutation.isPending;
  const canSubmit =
    selectedOrder && selectedTemplateId && previewImages.length > 0;
  const isLoading = ordersLoading || templatesLoading;

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <CreateApprovalSkeleton />;
  }

  // Show error state if orders failed to load
  if (ordersError || !ordersResponse?.success) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load orders. Please try again.
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="ml-2 p-0 h-auto"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/admin/communication/approvals">
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Send Design Approval
            </h1>
          </div>
          <p className="text-muted-foreground">
            Send a design approval request to your customer for review
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Order */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                    1
                  </div>
                  Select Order
                </CardTitle>
                <CardDescription>
                  Choose the order that needs design approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedOrder && (
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order number, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                )}

                {selectedOrder ? (
                  <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {selectedOrder.customer?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {selectedOrder.orderNumber}
                            </span>
                            <Badge variant="outline">
                              {selectedOrder.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.customer?.name || "Unknown Customer"}{" "}
                            • {selectedOrder.customer?.email || "No email"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {selectedOrder.orderItems?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {item.productName} (
                              {item.material || "Unknown material"})
                            </span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground">
                            No items found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {ordersLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map((order: any) => (
                        <div
                          key={order.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleOrderSelect(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {order.customer?.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {order.orderNumber}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {order.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {order.customer?.name || "Unknown Customer"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ${order.totalAmount?.toFixed(2) || "0.00"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.orderItems?.length || 0} items
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          {searchTerm
                            ? "No orders found matching your search"
                            : "No orders available for approval"}
                        </p>
                        {searchTerm && (
                          <Button
                            variant="link"
                            onClick={() => setSearchTerm("")}
                            className="mt-2"
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Upload Preview Images */}
            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                      2
                    </div>
                    Design Preview Images
                  </CardTitle>
                  <CardDescription>
                    Upload images showing the design for customer approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm font-medium">
                        Click to upload images
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </label>
                  </div>

                  {/* Preview Images Grid */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                            <img
                              src={image.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePreviewImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Email Template */}
            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                      3
                    </div>
                    Email Template
                  </CardTitle>
                  <CardDescription>
                    Choose the email template to send to your customer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={selectedTemplateId}
                      onValueChange={setSelectedTemplateId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select email template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(value) => setPriority(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customMessage">
                      Additional Message (Optional)
                    </Label>
                    <Textarea
                      id="customMessage"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add a personal message to include with the approval request..."
                      rows={3}
                    />
                  </div>

                  {selectedTemplateId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                      disabled={previewEmailMutation.isPending}
                    >
                      {previewEmailMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Preview Email"
                      )}
                    </Button>
                  )}

                  {/* Preview Content */}
                  {previewEmailMutation.data && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Email Preview</h4>
                      <div className="text-sm">
                        <p className="font-medium mb-1">
                          Subject: {previewEmailMutation.data.subject}
                        </p>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: previewEmailMutation.data.htmlContent,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Approval Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Customer:</span>
                      <span className="font-medium">
                        {selectedOrder.customer?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Email:</span>
                      <span className="font-medium">
                        {selectedOrder.customer?.email || "No email"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Order:</span>
                      <span className="font-medium">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">
                        ${selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Images:</span>
                      <span className="font-medium">
                        {previewImages.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Approval...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Approval Request
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>

                {!canSubmit && (
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {!selectedOrder && "Please select an order to continue."}
                      {selectedOrder &&
                        !selectedTemplateId &&
                        "Please select an email template."}
                      {selectedOrder &&
                        selectedTemplateId &&
                        previewImages.length === 0 &&
                        "Please upload at least one preview image."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Upload high-quality preview images</p>
                <p>• Include all design elements clearly</p>
                <p>• Use appropriate email templates</p>
                <p>• Add personal messages when needed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  X,
  Upload,
  Eye,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  User,
  Mail,
  FileText,
  Calendar,
  Image as ImageIcon,
  Badge,
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
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Select } from "@radix-ui/react-select";
import { Button } from "react-day-picker";
import { Label } from "recharts";

// Mock data for orders that need approval
const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerId: "CUST-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    status: "DESIGN_PENDING",
    totalAmount: 485.0,
    createdAt: "2024-01-15T10:00:00Z",
    orderItems: [
      {
        id: "1",
        productName: "Custom T-Shirt",
        quantity: 50,
        material: "Cotton",
        specifications: "Navy blue with white logo",
      },
    ],
    designFiles: [
      { id: "1", name: "logo-design.ai", url: "/files/logo-design.ai" },
      { id: "2", name: "preview.jpg", url: "/images/preview.jpg" },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerId: "CUST-002",
    customerName: "Jane Smith",
    customerEmail: "jane@company.com",
    status: "PAYMENT_CONFIRMED",
    totalAmount: 225.0,
    createdAt: "2024-01-14T14:30:00Z",
    orderItems: [
      {
        id: "2",
        productName: "Business Cards",
        quantity: 1000,
        material: "Premium Card Stock",
        specifications: "Double-sided, matte finish",
      },
    ],
    designFiles: [
      { id: "3", name: "business-card-front.pdf", url: "/files/bc-front.pdf" },
      { id: "4", name: "business-card-back.pdf", url: "/files/bc-back.pdf" },
    ],
  },
];

const emailTemplates = [
  {
    id: "gentle",
    name: "Gentle Reminder",
    subject: "Design Approval Needed - Order #{orderNumber}",
    content: `Hi {customerName},

We're excited to move forward with your order #{orderNumber}! 

We've prepared your design and would love for you to review and approve it. Please take a moment to check the preview and let us know if everything looks perfect.

Best regards,
The Design Team`,
  },
  {
    id: "urgent",
    name: "Urgent Follow-up",
    subject: "Urgent: Design Approval Required - Order #{orderNumber}",
    content: `Dear {customerName},

We need your design approval to keep your order #{orderNumber} on schedule for the promised delivery date.

Please review the attached design at your earliest convenience.

Time-sensitive - please respond within 24 hours.

Thank you,
The Production Team`,
  },
  {
    id: "final",
    name: "Final Notice",
    subject: "Final Notice: Design Approval Required - Order #{orderNumber}",
    content: `Dear {customerName},

This is a final reminder that we need your approval for order #{orderNumber} to proceed with production.

Without approval within 24 hours, your order may be delayed or cancelled.

Please respond immediately.

Urgent regards,
The Management Team`,
  },
];

export default function CreateApprovalPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("gentle");
  const [customMessage, setCustomMessage] = useState("");
  const [expiryHours, setExpiryHours] = useState(72);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get order ID from URL params (would normally use useSearchParams)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    if (orderId) {
      const order = mockOrders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, []);

  // Filter orders based on search
  const filteredOrders = mockOrders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    // Set default preview images from design files
    const imageFiles = order.designFiles.filter((file) =>
      file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    setPreviewImages(
      imageFiles.map((file) => ({ url: file.url, name: file.name }))
    );
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages((prev) => [
          ...prev,
          {
            url: e.target.result,
            name: file.name,
            file: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreviewImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real app, would call API to send approval
      console.log("Sending design approval:", {
        orderId: selectedOrder.id,
        customerEmail: selectedOrder.customerEmail,
        designSummary: {
          productName: selectedOrder.orderItems[0].productName,
          quantity: selectedOrder.orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          material: selectedOrder.orderItems[0].material,
        },
        previewImages: previewImages.map((img) => img.url),
        template: selectedTemplate,
        customMessage,
        expiryHours,
      });

      // Redirect to approvals list with success message
      window.location.href =
        "/dashboard/admin/communication/approvals?success=approval-sent";
    } catch (error) {
      console.error("Error sending approval:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTemplatePreview = () => {
    if (!selectedOrder) return "";

    const template = emailTemplates.find((t) => t.id === selectedTemplate);
    if (!template) return "";

    return template.content
      .replace(/{customerName}/g, selectedOrder.customerName)
      .replace(/{orderNumber}/g, selectedOrder.orderNumber);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <a
              href="/dashboard/admin/communication/approvals"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </a>
            <h1 className="text-3xl font-bold tracking-tight">
              Send Design Approval
            </h1>
          </div>
          <p className="text-gray-600">
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
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                            {selectedOrder.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
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
                          <p className="text-sm text-gray-600">
                            {selectedOrder.customerName} •{" "}
                            {selectedOrder.customerEmail}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${selectedOrder.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedOrder(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Order Items:</h4>
                      <div className="space-y-2">
                        {selectedOrder.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>
                              {item.productName} ({item.material})
                            </span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOrderSelect(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {order.customerName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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
                              <p className="text-xs text-gray-600">
                                {order.customerName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.orderItems.length} items
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </label>
                  </div>

                  {/* Preview Images Grid */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
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
                          <p className="text-xs text-gray-600 mt-1 truncate">
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
                    <Label htmlFor="template">Template Type</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      {emailTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Email Preview</Label>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium mb-2">
                        Subject:{" "}
                        {emailTemplates
                          .find((t) => t.id === selectedTemplate)
                          ?.subject.replace(
                            /{orderNumber}/g,
                            selectedOrder.orderNumber
                          )}
                      </p>
                      <div className="whitespace-pre-line">
                        {getTemplatePreview()}
                      </div>
                    </div>
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
                        {selectedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Email:</span>
                      <span className="font-medium">
                        {selectedOrder.customerEmail}
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
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="expiry">Approval Expires In</Label>
                        <Select
                          value={expiryHours.toString()}
                          onValueChange={(value) =>
                            setExpiryHours(parseInt(value))
                          }
                        >
                          <option value="24">24 hours</option>
                          <option value="48">48 hours</option>
                          <option value="72">72 hours (3 days)</option>
                          <option value="168">1 week</option>
                        </Select>
                      </div>
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
                    disabled={
                      !selectedOrder ||
                      previewImages.length === 0 ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
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
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                </div>

                {(!selectedOrder || previewImages.length === 0) && (
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {!selectedOrder && "Please select an order to continue."}
                      {selectedOrder &&
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
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Upload high-quality preview images</p>
                <p>• Include all design elements clearly</p>
                <p>• Use appropriate email tone for urgency</p>
                <p>• Set reasonable approval timeframes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

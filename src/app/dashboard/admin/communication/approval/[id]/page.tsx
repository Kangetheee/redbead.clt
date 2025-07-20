/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Calendar,
  User,
  Package,
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  RefreshCw,
  MessageSquare,
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
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Button } from "react-day-picker";

// Mock approval data
const mockApproval = {
  id: "1",
  orderNumber: "ORD-2024-001",
  orderId: "order-123",
  status: "PENDING",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  designSummary: {
    productName: "Custom T-Shirt",
    quantity: 50,
    material: "Cotton",
    text: "Company Logo Design",
    colors: ["Navy Blue", "White"],
    dimensions: '12" x 8"',
    printType: "Screen Print",
  },
  previewImages: [
    "/images/preview1.jpg",
    "/images/preview2.jpg",
    "/images/preview3.jpg",
  ],
  requestedAt: "2024-01-15T10:00:00Z",
  expiresAt: "2024-01-18T10:00:00Z",
  respondedAt: null,
  approvedBy: null,
  rejectedBy: null,
  rejectionReason: null,
  comments: null,
  emailsSent: 2,
  lastEmailSentAt: "2024-01-16T14:30:00Z",
  orderDetails: {
    totalAmount: 485.0,
    itemCount: 1,
    expectedDelivery: "2024-01-25T00:00:00Z",
  },
  communicationHistory: [
    {
      id: "1",
      type: "EMAIL_SENT",
      timestamp: "2024-01-15T10:00:00Z",
      details: "Initial approval request sent",
      recipient: "john@example.com",
    },
    {
      id: "2",
      type: "EMAIL_SENT",
      timestamp: "2024-01-16T14:30:00Z",
      details: "Reminder email sent",
      recipient: "john@example.com",
    },
  ],
};

const formatDistanceToNow = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

const getTimeRemaining = (expiresAt) => {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs <= 0) return "Expired";
  if (diffHours < 1) return "Less than 1 hour";
  if (diffHours < 24) return `${diffHours} hours`;
  return `${diffDays} days, ${diffHours % 24} hours`;
};

export default function ApprovalDetailsPage() {
  const [isResending, setIsResending] = useState(false);

  const approval = mockApproval;

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpired = new Date(approval.expiresAt) < new Date();
  const isPending = approval.status === "PENDING" && !isExpired;

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Resending approval email");
    } catch (error) {
      console.error("Error resending email:", error);
    } finally {
      setIsResending(false);
    }
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
              Design Approval Details
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(approval.status)}
            <span className="text-sm text-gray-600">
              Order {approval.orderNumber}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Resend Email
            </Button>
          )}
          <a
            href={`/dashboard/admin/communication/approvals/${approval.id}/edit`}
          >
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Settings
            </Button>
          </a>
          <a href={`/dashboard/admin/orders/${approval.orderId}`}>
            <Button>
              <Eye className="mr-2 h-4 w-4" />
              View Order
            </Button>
          </a>
        </div>
      </div>

      {/* Status Alert */}
      {isExpired && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This approval request has expired. Consider sending a new request or
            contacting the customer directly.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Design Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Design Preview</CardTitle>
              <CardDescription>
                Images sent to customer for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approval.previewImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approval.previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                        <img
                          src={image}
                          alt={`Design preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No preview images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Design Summary</CardTitle>
              <CardDescription>
                Details about the design requiring approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Product</h4>
                    <p className="text-sm text-gray-600">
                      {approval.designSummary.productName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Quantity</h4>
                    <p className="text-sm text-gray-600">
                      {approval.designSummary.quantity} pieces
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Material</h4>
                    <p className="text-sm text-gray-600">
                      {approval.designSummary.material}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Print Type</h4>
                    <p className="text-sm text-gray-600">
                      {approval.designSummary.printType}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Design Text</h4>
                    <p className="text-sm text-gray-600">
                      {approval.designSummary.text}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Colors</h4>
                    <div className="flex gap-1">
                      {approval.designSummary.colors.map((color, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Dimensions</h4>
                    <p className="text-sm text-gray-600">
                      {approval.designSummary.dimensions}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication History */}
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                All emails and interactions related to this approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approval.communicationHistory.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{event.details}</p>
                        <span className="text-xs text-gray-600">
                          {formatDistanceToNow(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        To: {event.recipient}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Response */}
          {approval.status !== "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Response</CardTitle>
                <CardDescription>
                  Feedback and decision from the customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(approval.status)}
                    <span className="text-sm text-gray-600">
                      {approval.respondedAt &&
                        `on ${formatDate(approval.respondedAt)}`}
                    </span>
                  </div>

                  {approval.status === "APPROVED" && approval.approvedBy && (
                    <div>
                      <h4 className="font-medium mb-1">Approved By</h4>
                      <p className="text-sm text-gray-600">
                        {approval.approvedBy}
                      </p>
                    </div>
                  )}

                  {approval.status === "REJECTED" && (
                    <div className="space-y-3">
                      {approval.rejectedBy && (
                        <div>
                          <h4 className="font-medium mb-1">Rejected By</h4>
                          <p className="text-sm text-gray-600">
                            {approval.rejectedBy}
                          </p>
                        </div>
                      )}
                      {approval.rejectionReason && (
                        <div>
                          <h4 className="font-medium mb-1">Rejection Reason</h4>
                          <p className="text-sm text-gray-600">
                            {approval.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {approval.comments && (
                    <div>
                      <h4 className="font-medium mb-1">Comments</h4>
                      <p className="text-sm text-gray-600">
                        {approval.comments}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <div>{getStatusBadge(approval.status)}</div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Time Remaining:</span>
                  <span
                    className={`text-sm font-medium ${isExpired ? "text-red-600" : "text-gray-900"}`}
                  >
                    {getTimeRemaining(approval.expiresAt)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Emails Sent:</span>
                  <span className="text-sm font-medium">
                    {approval.emailsSent}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Last Email:</span>
                  <span className="text-sm text-gray-600">
                    {formatDistanceToNow(approval.lastEmailSentAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {approval.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{approval.customerName}</p>
                  <p className="text-sm text-gray-600">
                    {approval.customerEmail}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Order Value:</span>
                  <span className="text-sm font-medium">
                    ${approval.orderDetails.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Items:</span>
                  <span className="text-sm font-medium">
                    {approval.orderDetails.itemCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expected Delivery:</span>
                  <span className="text-sm font-medium">
                    {new Date(
                      approval.orderDetails.expectedDelivery
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href={`/dashboard/admin/orders/${approval.orderId}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  View Full Order
                </Button>
              </a>

              <a href={`mailto:${approval.customerEmail}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Customer
                </Button>
              </a>

              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Internal Note
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Requested:</span>
                  <span className="text-gray-600">
                    {formatDate(approval.requestedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="text-gray-600">
                    {formatDate(approval.expiresAt)}
                  </span>
                </div>
                {approval.respondedAt && (
                  <div className="flex justify-between">
                    <span>Responded:</span>
                    <span className="text-gray-600">
                      {formatDate(approval.respondedAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

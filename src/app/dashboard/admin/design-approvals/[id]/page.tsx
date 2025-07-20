/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Calendar,
  User,
  Package,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  ExternalLink,
  Download,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface DesignApproval {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  designSummary: {
    productName: string;
    quantity: number;
    material?: string;
    colors?: string[];
    dimensions?: string;
    specialInstructions?: string;
  };
  previewImages: string[];
  requestedAt: string;
  respondedAt?: string;
  expiresAt: string;
  approvedBy?: string;
  rejectionReason?: string;
  emailSent: boolean;
  remindersSent: number;
  approvalToken: string;
  metadata?: {
    rushOrder?: boolean;
    specialInstructions?: string;
  };
}

interface ApprovalHistory {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details?: string;
}

const getStatusColor = (status: DesignApproval["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    case "EXPIRED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: DesignApproval["status"]) => {
  switch (status) {
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    case "APPROVED":
      return <CheckCircle className="w-4 h-4" />;
    case "REJECTED":
      return <XCircle className="w-4 h-4" />;
    case "EXPIRED":
      return <AlertTriangle className="w-4 h-4" />;
    case "CANCELLED":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function DesignApprovalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [approval, setApproval] = useState<DesignApproval | null>(null);
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchApproval = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        const mockApproval: DesignApproval = {
          id: params.id as string,
          orderId: "ord-001",
          orderNumber: "ORD-2024-0001",
          customerName: "John Doe",
          customerEmail: "john.doe@example.com",
          status: "PENDING",
          designSummary: {
            productName: "Custom Polyester Lanyard",
            quantity: 100,
            material: "Polyester",
            colors: ["Blue", "White"],
            dimensions: "15mm x 900mm",
            specialInstructions: "Logo must be centered with high resolution",
          },
          previewImages: [
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
          ],
          requestedAt: "2024-01-15T10:30:00.000Z",
          expiresAt: "2024-01-18T10:30:00.000Z",
          emailSent: true,
          remindersSent: 1,
          approvalToken: "da_token_abc123xyz",
          metadata: {
            rushOrder: true,
            specialInstructions: "Customer needs this for event on Jan 20th",
          },
        };

        const mockHistory: ApprovalHistory[] = [
          {
            id: "h1",
            action: "Approval Requested",
            performedBy: "System",
            performedAt: "2024-01-15T10:30:00.000Z",
            details: "Design approval email sent to customer",
          },
          {
            id: "h2",
            action: "Reminder Sent",
            performedBy: "System",
            performedAt: "2024-01-16T10:30:00.000Z",
            details: "First reminder email sent",
          },
        ];

        setApproval(mockApproval);
        setHistory(mockHistory);
      } catch (error) {
        console.error("Error fetching design approval:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApproval();
  }, [params.id]);

  const handleResendEmail = async () => {
    setActionLoading(true);
    try {
      // API call to resend email
      console.log("Resending approval email");
      // Add to history
      const newHistoryItem: ApprovalHistory = {
        id: `h${Date.now()}`,
        action: "Email Resent",
        performedBy: "Admin User",
        performedAt: new Date().toISOString(),
        details: "Approval email manually resent",
      };
      setHistory((prev) => [...prev, newHistoryItem]);
    } catch (error) {
      console.error("Error resending email:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelApproval = async () => {
    setActionLoading(true);
    try {
      // API call to cancel approval
      console.log("Cancelling approval");
      if (approval) {
        setApproval({
          ...approval,
          status: "CANCELLED",
        });
      }
    } catch (error) {
      console.error("Error cancelling approval:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const copyApprovalLink = () => {
    const approvalLink = `${window.location.origin}/approve-design/${approval?.approvalToken}`;
    navigator.clipboard.writeText(approvalLink);
    // Show toast notification
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Design Approval Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The design approval you&apos;re looking for doesn&apos;t exist or has
          been removed.
        </p>
        <Button asChild>
          <Link href="/admin/design-approvals">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Design Approvals
          </Link>
        </Button>
      </div>
    );
  }

  const isExpired = new Date(approval.expiresAt) < new Date();
  const isActionable = approval.status === "PENDING" && !isExpired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/admin/design-approvals">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Design Approval Details
            </h1>
            <p className="text-gray-600">Order {approval.orderNumber}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(approval.status)}>
            <span className="flex items-center space-x-1">
              {getStatusIcon(approval.status)}
              <span>{approval.status}</span>
            </span>
          </Badge>

          {approval.metadata?.rushOrder && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Rush Order
            </Badge>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {isExpired && approval.status === "PENDING" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This approval request has expired. The customer can no longer
            approve this design.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {approval.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {approval.customerName}
                  </h3>
                  <p className="text-gray-600">{approval.customerEmail}</p>

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <Link
                        href={`/admin/orders/${approval.orderId}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Order {approval.orderNumber}
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Design Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <p className="text-gray-900">
                    {approval.designSummary.productName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <p className="text-gray-900">
                    {approval.designSummary.quantity} units
                  </p>
                </div>

                {approval.designSummary.material && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Material
                    </label>
                    <p className="text-gray-900">
                      {approval.designSummary.material}
                    </p>
                  </div>
                )}

                {approval.designSummary.dimensions && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dimensions
                    </label>
                    <p className="text-gray-900">
                      {approval.designSummary.dimensions}
                    </p>
                  </div>
                )}

                {approval.designSummary.colors && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Colors
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      {approval.designSummary.colors.map((color, index) => (
                        <Badge key={index} variant="outline">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {approval.designSummary.specialInstructions && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Special Instructions
                    </label>
                    <p className="text-gray-900">
                      {approval.designSummary.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Design Previews</span>
              </CardTitle>
              <CardDescription>
                These are the designs sent to the customer for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approval.previewImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image}
                      alt={`Design preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 bg-white bg-opacity-90 rounded-full p-2">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {item.action}
                        </h4>
                        <span className="text-sm text-gray-600">
                          {format(
                            new Date(item.performedAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        by {item.performedBy}
                      </p>
                      {item.details && (
                        <p className="text-sm text-gray-700 mt-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Timing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Requested
                </label>
                <p className="text-gray-900">
                  {format(new Date(approval.requestedAt), "MMM dd, yyyy HH:mm")}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(approval.requestedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Expires
                </label>
                <p
                  className={`${isExpired ? "text-red-600" : "text-gray-900"}`}
                >
                  {format(new Date(approval.expiresAt), "MMM dd, yyyy HH:mm")}
                </p>
                <p className="text-sm text-gray-600">
                  {isExpired
                    ? "Expired"
                    : formatDistanceToNow(new Date(approval.expiresAt), {
                        addSuffix: true,
                      })}
                </p>
              </div>

              {approval.respondedAt && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Responded
                    </label>
                    <p className="text-gray-900">
                      {format(
                        new Date(approval.respondedAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(approval.respondedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email Sent</span>
                <Badge variant={approval.emailSent ? "default" : "destructive"}>
                  {approval.emailSent ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Reminders Sent</span>
                <Badge variant="outline">{approval.remindersSent}</Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={copyApprovalLink}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Copy Approval Link
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isActionable && (
                <>
                  <Button
                    onClick={handleResendEmail}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    {actionLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Resend Email
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link
                      href={`/admin/design-approvals/${approval.id}/review`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Review & Decide
                    </Link>
                  </Button>
                </>
              )}

              {approval.status === "PENDING" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelApproval}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Approval
                </Button>
              )}

              <Button variant="outline" asChild className="w-full">
                <Link href={`/admin/orders/${approval.orderId}`}>
                  <Package className="w-4 h-4 mr-2" />
                  View Order
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt="Design preview"
              width={800}
              height={600}
              className="object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  User,
  Package,
  FileText,
  Eye,
  RefreshCw,
  MessageSquare,
  Download,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useEmailLog,
  useEmailLogs,
  useSendEmail,
} from "@/hooks/use-communication";
import { EmailStatus } from "@/lib/communications/dto/email-logs.dto";

interface ApprovalDetailsPageProps {
  approvalId: string;
}

interface CommunicationEvent {
  id: string;
  type: "EMAIL_SENT" | "EMAIL_OPENED" | "EMAIL_CLICKED" | "EMAIL_BOUNCED";
  timestamp: string;
  details: string;
  recipient: string;
  metadata?: Record<string, any>;
}

interface ApprovalData {
  id: string;
  orderNumber: string;
  orderId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  customerName: string;
  customerEmail: string;
  designSummary: {
    productName: string;
    quantity: number;
    material: string;
    text: string;
    colors: string[];
    dimensions: string;
    printType: string;
  };
  previewImages: string[];
  requestedAt: string;
  expiresAt: string;
  respondedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  comments?: string;
  emailsSent: number;
  lastEmailSentAt?: string;
  orderDetails: {
    totalAmount: number;
    itemCount: number;
    expectedDelivery: string;
    customer: {
      name: string;
      email: string;
    };
  };
}

function ApprovalDetailsSkeleton() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ApprovalDetailsPage({
  approvalId,
}: ApprovalDetailsPageProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  // TanStack Query hooks
  const { data: emailLog, isLoading, error, refetch } = useEmailLog(approvalId);

  const { data: relatedEmailsData } = useEmailLogs({
    orderId: emailLog?.orderId,
    limit: 10,
  });

  const sendEmailMutation = useSendEmail();

  const relatedEmails = relatedEmailsData?.items || [];

  // Mock function to convert email log to approval data
  // In real implementation, you'd have a separate approvals API
  const mockApprovalFromEmailLog = (
    log: typeof emailLog
  ): ApprovalData | null => {
    if (!log) return null;

    return {
      id: log.id,
      orderNumber: log.orderId || "N/A",
      orderId: log.orderId || "",
      status: log.status === "DELIVERED" ? "PENDING" : "EXPIRED",
      customerName: log.recipientName || "Unknown Customer",
      customerEmail: log.recipientEmail,
      designSummary: {
        productName: "Custom Product",
        quantity: 1,
        material: "Unknown",
        text: "Design approval request",
        colors: ["Unknown"],
        dimensions: "Unknown",
        printType: "Unknown",
      },
      previewImages: [],
      requestedAt: log.createdAt,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      emailsSent: relatedEmails.length,
      lastEmailSentAt: log.sentAt,
      orderDetails: {
        totalAmount: 0,
        itemCount: 1,
        expectedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        customer: {
          name: log.recipientName || "Unknown Customer",
          email: log.recipientEmail,
        },
      },
    };
  };

  const approval = mockApprovalFromEmailLog(emailLog);

  const getStatusBadge = (status: string) => {
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

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs <= 0) return "Expired";
    if (diffHours < 1) return "Less than 1 hour";
    if (diffHours < 24) return `${diffHours} hours`;
    return `${diffDays} days, ${diffHours % 24} hours`;
  };

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResendEmail = async () => {
    if (!emailLog) return;

    setIsResending(true);
    try {
      await sendEmailMutation.mutateAsync({
        templateId: emailLog.templateId,
        recipientEmail: emailLog.recipientEmail,
        recipientName: emailLog.recipientName || undefined,
        variables: {
          orderNumber: emailLog.orderId || "",
          customerName: emailLog.recipientName || "",
        },
        orderId: emailLog.orderId || undefined,
        priority: "normal",
        trackOpens: true,
        trackClicks: true,
        tags: ["resend", "design-approval"],
      });
      refetch();
    } catch (error) {
      console.error("Error resending email:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return <ApprovalDetailsSkeleton />;
  }

  if (error || !emailLog || !approval) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load approval details. Please check if the approval exists
            and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isExpired = new Date(approval.expiresAt) < new Date();
  const isPending = approval.status === "PENDING" && !isExpired;

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/communication/approvals">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Design Approval Details
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(approval.status)}
            <span className="text-sm text-muted-foreground">
              Order {approval.orderNumber}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending || sendEmailMutation.isPending}
            >
              {isResending || sendEmailMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Resend Email
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link
              href={`/dashboard/admin/communication/approvals/${approval.id}/edit`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Settings
            </Link>
          </Button>
          {approval.orderId && (
            <Button asChild>
              <Link href={`/dashboard/admin/orders/${approval.orderId}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Order
              </Link>
            </Button>
          )}
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
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
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
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No preview images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
              <CardDescription>
                Details about the sent approval email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Template</h4>
                    <p className="text-sm text-muted-foreground">
                      {emailLog.templateName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Subject</h4>
                    <p className="text-sm text-muted-foreground">
                      {emailLog.subject}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Status</h4>
                    <Badge
                      variant={
                        emailLog.status === "DELIVERED" ? "default" : "outline"
                      }
                      className={
                        emailLog.status === "DELIVERED"
                          ? "bg-green-100 text-green-800"
                          : emailLog.status === "FAILED" ||
                              emailLog.status === "BOUNCED"
                            ? "bg-red-100 text-red-800"
                            : ""
                      }
                    >
                      {emailLog.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Sent At</h4>
                    <p className="text-sm text-muted-foreground">
                      {emailLog.sentAt
                        ? formatDate(emailLog.sentAt)
                        : "Not sent"}
                    </p>
                  </div>
                  {emailLog.deliveredAt && (
                    <div>
                      <h4 className="font-medium mb-1">Delivered At</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(emailLog.deliveredAt)}
                      </p>
                    </div>
                  )}
                  {emailLog.openedAt && (
                    <div>
                      <h4 className="font-medium mb-1">Opened At</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(emailLog.openedAt)}
                      </p>
                    </div>
                  )}
                  {emailLog.clickedAt && (
                    <div>
                      <h4 className="font-medium mb-1">Clicked At</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(emailLog.clickedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {emailLog.errorMessage && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {emailLog.errorMessage}
                  </AlertDescription>
                </Alert>
              )}
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
                {relatedEmails.map((email, index) => (
                  <div
                    key={email.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {email.templateName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {email.sentAt
                            ? formatDistanceToNow(email.sentAt)
                            : "Not sent"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        To: {email.recipientEmail}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            email.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : email.status === "FAILED" ||
                                  email.status === "BOUNCED"
                                ? "bg-red-100 text-red-800"
                                : ""
                          }`}
                        >
                          {email.status}
                        </Badge>
                        {email.sentAt && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(email.sentAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {relatedEmails.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No communication history available</p>
                  </div>
                )}
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
                    <span className="text-sm text-muted-foreground">
                      {approval.respondedAt &&
                        `on ${formatDate(approval.respondedAt)}`}
                    </span>
                  </div>

                  {approval.status === "APPROVED" && approval.approvedBy && (
                    <div>
                      <h4 className="font-medium mb-1">Approved By</h4>
                      <p className="text-sm text-muted-foreground">
                        {approval.approvedBy}
                      </p>
                    </div>
                  )}

                  {approval.status === "REJECTED" && (
                    <div className="space-y-3">
                      {approval.rejectedBy && (
                        <div>
                          <h4 className="font-medium mb-1">Rejected By</h4>
                          <p className="text-sm text-muted-foreground">
                            {approval.rejectedBy}
                          </p>
                        </div>
                      )}
                      {approval.rejectionReason && (
                        <div>
                          <h4 className="font-medium mb-1">Rejection Reason</h4>
                          <p className="text-sm text-muted-foreground">
                            {approval.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {approval.comments && (
                    <div>
                      <h4 className="font-medium mb-1">Comments</h4>
                      <p className="text-sm text-muted-foreground">
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
                    className={`text-sm font-medium ${
                      isExpired ? "text-red-600" : "text-foreground"
                    }`}
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

                {approval.lastEmailSentAt && (
                  <div className="flex justify-between">
                    <span className="text-sm">Last Email:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(approval.lastEmailSentAt)}
                    </span>
                  </div>
                )}
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
                  <p className="text-sm text-muted-foreground">
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
              {approval.orderId && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/dashboard/admin/orders/${approval.orderId}`}>
                    <Package className="mr-2 h-4 w-4" />
                    View Full Order
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href={`mailto:${approval.customerEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Customer
                </a>
              </Button>

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
                  <span className="text-muted-foreground">
                    {formatDate(approval.requestedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="text-muted-foreground">
                    {formatDate(approval.expiresAt)}
                  </span>
                </div>
                {approval.respondedAt && (
                  <div className="flex justify-between">
                    <span>Responded:</span>
                    <span className="text-muted-foreground">
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

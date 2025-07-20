/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Send,
  User,
  Calendar,
  FileText,
  ExternalLink,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Separator } from "@/src/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { EmailLog } from "@/src/lib/emails/types/emails.types";

interface Timeline {
  timestamp: string;
  event: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  OPENED: "bg-purple-100 text-purple-800",
  CLICKED: "bg-indigo-100 text-indigo-800",
  BOUNCED: "bg-orange-100 text-orange-800",
  FAILED: "bg-red-100 text-red-800",
};

const STATUS_ICONS = {
  PENDING: Clock,
  SENT: Send,
  DELIVERED: CheckCircle,
  OPENED: Eye,
  CLICKED: TrendingUp,
  BOUNCED: AlertCircle,
  FAILED: XCircle,
};

export default function EmailLogDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [log, setLog] = useState<EmailLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  // Mock data - replace with actual API call
  const mockLog: EmailLog = {
    id: params.id as string,
    templateId: "tpl_design_approval_001",
    template: {
      id: "tpl_design_approval_001",
      name: "Design Approval Request",
      category: "DESIGN_APPROVAL_REQUEST",
    },
    recipientEmail: "john.doe@example.com",
    recipientName: "John Doe",
    subject: "Please Review and Approve Your Design - Order ORD-2024-0001",
    status: "OPENED",
    sentAt: "2024-01-20T14:30:00.000Z",
    deliveredAt: "2024-01-20T14:31:00.000Z",
    openedAt: "2024-01-20T15:15:00.000Z",
    metadata: {
      messageId: "msg_abc123def456",
      variables: {
        customerName: "John Doe",
        orderNumber: "ORD-2024-0001",
        productName: "Custom Printed Lanyard",
        quantity: "50",
        orderDate: "January 15, 2024",
        approvalLink: "https://app.example.com/approve/abc123",
        expiryDate: "January 22, 2024",
      },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "192.168.1.100",
    },
    orderId: "order_123",
    designApprovalId: "da_approval_001",
    retryCount: 0,
    createdAt: "2024-01-20T14:30:00.000Z",
    updatedAt: "2024-01-20T15:15:00.000Z",
    order: {
      id: "order_123",
      orderNumber: "ORD-2024-0001",
      status: "DESIGN_PENDING",
    },
    emailContent: {
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Design Approval Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0;">
      <h1 style="color: #333; margin: 0;">Design Approval Required</h1>
    </div>
    
    <div style="padding: 20px;">
      <p>Dear John Doe,</p>
      
      <p>Your custom design for order <strong>ORD-2024-0001</strong> is ready for review!</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Order Details:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Product: Custom Printed Lanyard</li>
          <li>Quantity: 50</li>
          <li>Order Date: January 15, 2024</li>
        </ul>
      </div>
      
      <p>Please click the button below to review and approve your design:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://app.example.com/approve/abc123" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Design
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        This approval link will expire on January 22, 2024. If you need any changes to your design, please let us know through the approval page.
      </p>
    </div>
  </div>
</body>
</html>`,
      textContent: `Design Approval Required

Dear John Doe,

Your custom design for order ORD-2024-0001 is ready for review!

Order Details:
- Product: Custom Printed Lanyard
- Quantity: 50
- Order Date: January 15, 2024

Please visit the following link to review and approve your design:
https://app.example.com/approve/abc123

This approval link will expire on January 22, 2024.`,
    },
  };

  useEffect(() => {
    fetchLog();
  }, [params.id]);

  const fetchLog = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/email-logs/${params.id}`);
      // const data = await response.json();

      setLog(mockLog);
    } catch (error) {
      console.error("Error fetching log:", error);
      toast.error("Failed to fetch email log");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!log) return;

    setRetrying(true);
    try {
      // Replace with actual API call
      // await fetch(`/api/email-logs/${params.id}/retry`, { method: 'POST' });

      toast.success("Email retry initiated");

      // Refresh the log data
      await fetchLog();
    } catch (error) {
      toast.error("Failed to retry email");
    } finally {
      setRetrying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getTimeline = (): Timeline[] => {
    if (!log) return [];

    const timeline: Timeline[] = [
      {
        timestamp: log.createdAt,
        event: "Email Created",
        description: "Email log entry created",
        icon: FileText,
      },
    ];

    if (log.sentAt) {
      timeline.push({
        timestamp: log.sentAt,
        event: "Email Sent",
        description: "Email sent to recipient",
        icon: Send,
      });
    }

    if (log.deliveredAt) {
      timeline.push({
        timestamp: log.deliveredAt,
        event: "Email Delivered",
        description: "Email delivered to recipient's inbox",
        icon: CheckCircle,
      });
    }

    if (log.openedAt) {
      timeline.push({
        timestamp: log.openedAt,
        event: "Email Opened",
        description: "Recipient opened the email",
        icon: Eye,
      });
    }

    if (log.clickedAt) {
      timeline.push({
        timestamp: log.clickedAt,
        event: "Link Clicked",
        description: "Recipient clicked a link in the email",
        icon: TrendingUp,
      });
    }

    if (log.status === "FAILED" && log.errorMessage) {
      timeline.push({
        timestamp: log.updatedAt,
        event: "Email Failed",
        description: log.errorMessage,
        icon: XCircle,
      });
    }

    return timeline.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getStatusIcon = (status: EmailLog["status"]) => {
    const Icon = STATUS_ICONS[status];
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-8">
        <p>Email log not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Email Log Details
            </h1>
            <p className="text-muted-foreground">
              Detailed information about email delivery and engagement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {log.status === "FAILED" && (
            <Button onClick={handleRetry} disabled={retrying}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${retrying ? "animate-spin" : ""}`}
              />
              {retrying ? "Retrying..." : "Retry"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/admin/email-logs")}
          >
            Back to Logs
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Recipient
                  </label>
                  <div className="mt-1">
                    <div className="font-medium">
                      {log.recipientName || "Unknown"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {log.recipientEmail}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => copyToClipboard(log.recipientEmail)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge className={STATUS_COLORS[log.status]}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        {log.status}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subject
                </label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <div className="font-medium">{log.subject}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Template
                </label>
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{log.template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.template.category.replace(/_/g, " ")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/email-templates/${log.templateId}`)
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Template
                  </Button>
                </div>
              </div>

              {log.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-red-600">
                    Error Message
                  </label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-800">{log.errorMessage}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML Source</TabsTrigger>
                  <TabsTrigger value="text">Plain Text</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          log.emailContent?.htmlContent ||
                          "<p>No content available</p>",
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="html" className="mt-4">
                  <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                      {log.emailContent?.htmlContent ||
                        "No HTML content available"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                  <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                      {log.emailContent?.textContent ||
                        "No plain text content available"}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Email Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTimeline().map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{event.event}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.timestamp), "MMM dd, HH:mm")}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Email Information */}
          <Card>
            <CardHeader>
              <CardTitle>Email Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>

                {log.sentAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Sent:</span>
                    <span>
                      {format(new Date(log.sentAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                )}

                {log.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Delivered:</span>
                    <span>
                      {format(new Date(log.deliveredAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                )}

                {log.openedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Opened:</span>
                    <span>
                      {format(new Date(log.openedAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                )}

                {log.clickedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Clicked:</span>
                    <span>
                      {format(new Date(log.clickedAt), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                )}

                {log.retryCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Retries:</span>
                    <span>{log.retryCount}</span>
                  </div>
                )}
              </div>

              <Separator />

              {log.metadata.messageId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Message ID
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {log.metadata.messageId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(log.metadata.messageId!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {log.metadata.userAgent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User Agent
                  </label>
                  <div className="mt-1 text-xs text-muted-foreground break-all">
                    {log.metadata.userAgent}
                  </div>
                </div>
              )}

              {log.metadata.ipAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    IP Address
                  </label>
                  <div className="mt-1 text-sm">{log.metadata.ipAddress}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Information */}
          <Card>
            <CardHeader>
              <CardTitle>Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {log.order && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Related Order
                  </label>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{log.order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.order.status}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/orders/${log.orderId}`)
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              )}

              {log.designApprovalId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Design Approval
                  </label>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-sm">Design approval requested</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/admin/design-approvals/${log.designApprovalId}`
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(log.metadata.variables).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-start gap-2"
                  >
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {key}
                    </code>
                    <span className="text-xs text-right">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

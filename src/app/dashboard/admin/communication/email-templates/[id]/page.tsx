/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(admin)/admin/email-templates/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Copy,
  Send,
  Eye,
  Code,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  Activity,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

// Types
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: string;
  isActive: boolean;
  isSystem: boolean;
  variables: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: "SENT" | "DELIVERED" | "OPENED" | "FAILED";
  sentAt: string;
  orderId?: string;
}

const CATEGORY_LABELS = {
  DESIGN_APPROVAL_REQUEST: "Design Approval Request",
  DESIGN_APPROVED: "Design Approved",
  DESIGN_REJECTED: "Design Rejected",
  ORDER_CONFIRMATION: "Order Confirmation",
  ORDER_STATUS_UPDATE: "Order Status Update",
  SHIPPING_NOTIFICATION: "Shipping Notification",
  PAYMENT_CONFIRMATION: "Payment Confirmation",
  CUSTOM: "Custom",
};

const STATUS_COLORS = {
  SENT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  OPENED: "bg-purple-100 text-purple-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function ViewEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [recentLogs, setRecentLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Mock data - replace with actual API calls
  const mockTemplate: EmailTemplate = {
    id: params.id as string,
    name: "Design Approval Request",
    subject: "Please Review and Approve Your Design - Order {{orderNumber}}",
    htmlContent: `
      <!DOCTYPE html>
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
            <p>Dear {{customerName}},</p>
            
            <p>Your custom design for order <strong>{{orderNumber}}</strong> is ready for review!</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Order Details:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Product: {{productName}}</li>
                <li>Quantity: {{quantity}}</li>
                <li>Order Date: {{orderDate}}</li>
              </ul>
            </div>
            
            <p>Please click the button below to review and approve your design:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{approvalLink}}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Design
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This approval link will expire on {{expiryDate}}. If you need any changes to your design, please let us know through the approval page.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px;">
              If you have any questions, please contact our support team.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `Design Approval Required

Dear {{customerName}},

Your custom design for order {{orderNumber}} is ready for review!

Order Details:
- Product: {{productName}}
- Quantity: {{quantity}}
- Order Date: {{orderDate}}

Please visit the following link to review and approve your design:
{{approvalLink}}

This approval link will expire on {{expiryDate}}.

If you have any questions, please contact our support team.`,
    category: "DESIGN_APPROVAL_REQUEST",
    isActive: true,
    isSystem: true,
    variables: [
      "customerName",
      "orderNumber",
      "productName",
      "quantity",
      "orderDate",
      "approvalLink",
      "expiryDate",
    ],
    createdBy: "System",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
  };

  const mockRecentLogs: EmailLog[] = [
    {
      id: "log1",
      recipientEmail: "john.doe@example.com",
      recipientName: "John Doe",
      subject: "Please Review and Approve Your Design - Order ORD-2024-0001",
      status: "OPENED",
      sentAt: "2024-01-20T14:30:00.000Z",
      orderId: "order-123",
    },
    {
      id: "log2",
      recipientEmail: "jane.smith@example.com",
      recipientName: "Jane Smith",
      subject: "Please Review and Approve Your Design - Order ORD-2024-0002",
      status: "DELIVERED",
      sentAt: "2024-01-20T12:15:00.000Z",
      orderId: "order-124",
    },
    {
      id: "log3",
      recipientEmail: "bob.wilson@example.com",
      recipientName: "Bob Wilson",
      subject: "Please Review and Approve Your Design - Order ORD-2024-0003",
      status: "SENT",
      sentAt: "2024-01-20T10:45:00.000Z",
      orderId: "order-125",
    },
  ];

  useEffect(() => {
    fetchTemplate();
    fetchRecentLogs();
  }, [params.id]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/email-templates/${params.id}`);
      // const data = await response.json();

      setTemplate(mockTemplate);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to fetch email template");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/email-logs?templateId=${params.id}&limit=5`);
      // const data = await response.json();

      setRecentLogs(mockRecentLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    setSendingTest(true);
    try {
      // Replace with actual API call
      // await fetch('/api/emails/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     templateId: template?.id,
      //     recipientEmail: testEmail,
      //     variables: {
      //       customerName: 'Test Customer',
      //       orderNumber: 'TEST-001',
      //       productName: 'Test Product',
      //       quantity: '10',
      //       orderDate: format(new Date(), 'MMMM dd, yyyy'),
      //       approvalLink: 'https://example.com/approve/test',
      //       expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'MMMM dd, yyyy')
      //     }
      //   })
      // });

      toast.success(`Test email sent to ${testEmail}`);
      setTestEmail("");
    } catch (error) {
      toast.error("Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Replace with actual API call
      // await fetch(`/api/email-templates/${params.id}`, { method: 'DELETE' });

      toast.success("Email template deleted successfully");
      router.push("/admin/email-templates");
    } catch (error) {
      toast.error("Failed to delete email template");
    }
  };

  const handleToggleStatus = async () => {
    if (!template) return;

    try {
      // Replace with actual API call
      // await fetch(`/api/email-templates/${params.id}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ isActive: !template.isActive })
      // });

      setTemplate({ ...template, isActive: !template.isActive });
      toast.success(
        `Template ${!template.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update template status");
    }
  };

  const renderPreviewWithSampleData = () => {
    if (!template) return "";

    let content = template.htmlContent;
    const sampleData = {
      customerName: "John Doe",
      orderNumber: "ORD-2024-0001",
      productName: "Custom Printed Lanyard",
      quantity: "50",
      orderDate: "January 15, 2024",
      approvalLink: "https://app.example.com/approve/abc123",
      expiryDate: "January 22, 2024",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, value);
    });

    return content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-8">
        <p>Template not found</p>
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
              {template.name}
            </h1>
            <p className="text-muted-foreground">
              Email template details and preview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a test email with sample data to verify the template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSendTestEmail}
                  disabled={sendingTest || !testEmail}
                >
                  {sendingTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/email-templates/${template.id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {template.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
                disabled={template.isSystem}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html">
                    <Code className="h-4 w-4 mr-2" />
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Code className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <div className="border rounded-lg p-4">
                    <div className="mb-4 pb-4 border-b">
                      <div className="text-sm text-muted-foreground mb-1">
                        Subject:
                      </div>
                      <div className="font-medium">
                        {template.subject.replace(
                          /{{(\w+)}}/g,
                          (match, variable) => {
                            const sampleValues: Record<string, string> = {
                              customerName: "John Doe",
                              orderNumber: "ORD-2024-0001",
                              productName: "Custom Printed Lanyard",
                            };
                            return sampleValues[variable] || match;
                          }
                        )}
                      </div>
                    </div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: renderPreviewWithSampleData(),
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="html">
                  <div className="border rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                      {template.htmlContent}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  <div className="border rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                      {template.textContent || "No text content provided"}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{log.recipientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.recipientEmail}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.sentAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[log.status]}>
                          {log.status}
                        </Badge>
                        {log.orderId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/orders/${log.orderId}`)
                            }
                          >
                            View Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/admin/email-logs?templateId=${template.id}`)
                    }
                  >
                    View All Logs
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent usage found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant={template.isSystem ? "outline" : "secondary"}>
                  {template.isSystem ? "System" : "Custom"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category</span>
                <Badge variant="outline">
                  {
                    CATEGORY_LABELS[
                      template.category as keyof typeof CATEGORY_LABELS
                    ]
                  }
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {format(new Date(template.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span>
                    {format(new Date(template.updatedAt), "MMM dd, yyyy")}
                  </span>
                </div>
                {template.createdBy && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created by:</span>
                    <span>{template.createdBy}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.variables.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="text-xs"
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No variables used
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Email Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email template? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

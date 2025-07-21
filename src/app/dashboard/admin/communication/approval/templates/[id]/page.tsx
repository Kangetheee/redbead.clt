/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Copy,
  Eye,
  Download,
  Send,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  FileText,
  Code,
  BarChart3,
  Settings,
  Loader2,
  TestTube,
  Trash2,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useEmailTemplate,
  useTemplateUsageStats,
  usePreviewEmailTemplate,
  useDuplicateEmailTemplate,
  useDeleteEmailTemplate,
  useUpdateEmailTemplate,
} from "@/hooks/use-communication";
import { EmailTemplateCategory } from "@/lib/communications/dto/email-template.dto";

function TemplateDetailsSkeleton() {
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
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
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

export default function TemplateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // TanStack Query hooks
  const {
    data: template,
    isLoading,
    error,
    refetch,
  } = useEmailTemplate(templateId);

  const { data: usageStats, isLoading: statsLoading } =
    useTemplateUsageStats(templateId);

  const previewEmailMutation = usePreviewEmailTemplate();
  const duplicateTemplateMutation = useDuplicateEmailTemplate();
  const deleteTemplateMutation = useDeleteEmailTemplate();
  const updateTemplateMutation = useUpdateEmailTemplate();

  const getCategoryBadge = (category: EmailTemplateCategory) => {
    const categoryConfig: Record<
      EmailTemplateCategory,
      { label: string; color: string }
    > = {
      DESIGN_APPROVAL_REQUEST: {
        label: "Request",
        color: "bg-blue-100 text-blue-800",
      },
      DESIGN_APPROVED: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
      },
      DESIGN_REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
      ORDER_CONFIRMATION: {
        label: "Order",
        color: "bg-purple-100 text-purple-800",
      },
      ORDER_STATUS_UPDATE: {
        label: "Update",
        color: "bg-orange-100 text-orange-800",
      },
      SHIPPING_NOTIFICATION: {
        label: "Shipping",
        color: "bg-cyan-100 text-cyan-800",
      },
      PAYMENT_CONFIRMATION: {
        label: "Payment",
        color: "bg-emerald-100 text-emerald-800",
      },
      CUSTOM: { label: "Custom", color: "bg-gray-100 text-gray-800" },
    };

    const config = categoryConfig[category];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handlePreview = async () => {
    if (!template) return;

    try {
      await previewEmailMutation.mutateAsync({
        templateId: template.id,
        variables: {
          customerName: "John Doe",
          orderNumber: "ORD-2024-001",
          companyName: "Your Company",
          productName: "Custom T-Shirt",
          quantity: 50,
          totalAmount: "$485.00",
        },
        deviceType: "desktop",
      });
    } catch (error) {
      console.error("Error previewing template:", error);
    }
  };

  const handleDuplicate = async () => {
    if (!template) return;

    try {
      await duplicateTemplateMutation.mutateAsync(template.id);
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    try {
      await deleteTemplateMutation.mutateAsync(template.id);
      router.push("/dashboard/admin/communication/approvals/templates");
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const toggleTemplateStatus = async () => {
    if (!template) return;

    try {
      await updateTemplateMutation.mutateAsync({
        templateId: template.id,
        values: { isActive: !template.isActive },
      });
    } catch (error) {
      console.error("Error updating template status:", error);
    }
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

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return <TemplateDetailsSkeleton />;
  }

  if (error || !template) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load template details. Please check if the template exists
            and try again.
            <Button
              variant="link"
              onClick={() => refetch()}
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
              <Link href="/dashboard/admin/communication/approvals/templates">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Email Template Details
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{template.name}</span>
            {getCategoryBadge(template.category)}
            <Badge variant={template.isActive ? "default" : "outline"}>
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
            {template.isSystem && <Badge variant="secondary">System</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={previewEmailMutation.isPending}
          >
            {previewEmailMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Preview
          </Button>

          <Button variant="outline" asChild>
            <Link
              href={`/dashboard/admin/communication/approvals/templates/${template.id}/edit`}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={duplicateTemplateMutation.isPending}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={toggleTemplateStatus}
                disabled={updateTemplateMutation.isPending}
              >
                {template.isActive ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Template
              </DropdownMenuItem>

              <DropdownMenuItem>
                <TestTube className="mr-2 h-4 w-4" />
                Send Test Email
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {!template.isSystem && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Template
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Template Subject */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <h4 className="font-medium mb-1">Subject Line</h4>
            <p className="text-muted-foreground">{template.subject}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content">
            <Code className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Template Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>
                    Basic details and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Name</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.name}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Category</h4>
                        {getCategoryBadge(template.category)}
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Status</h4>
                        <Badge
                          variant={template.isActive ? "default" : "outline"}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Created</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(template.createdAt)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Last Modified</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(template.updatedAt)}
                        </p>
                      </div>
                      {template.isSystem && (
                        <div>
                          <h4 className="font-medium mb-1">Type</h4>
                          <Badge variant="secondary">System Template</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variables */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Variables</CardTitle>
                  <CardDescription>
                    Variables used in this template for personalization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {template.variables && template.variables.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {template.variables.map((variable, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="justify-center"
                        >
                          {"{" + variable + "}"}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No variables defined for this template
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              {previewEmailMutation.data && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      Template preview with sample data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-muted">
                      <div className="bg-background rounded p-4 shadow-sm">
                        <div className="border-b pb-3 mb-4">
                          <p className="text-sm text-muted-foreground">
                            Subject:
                          </p>
                          <p className="font-medium">
                            {previewEmailMutation.data.subject}
                          </p>
                        </div>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: previewEmailMutation.data.htmlContent,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Usage Statistics */}
              {!statsLoading && usageStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {usageStats.totalSent}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Sent
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {usageStats.deliveryRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Delivery Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {usageStats.openRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Open Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {usageStats.clickRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Click Rate
                        </div>
                      </div>
                    </div>

                    {usageStats.lastUsed && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Last Used:</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(usageStats.lastUsed)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link
                      href={`/dashboard/admin/communication/approvals/templates/${template.id}/edit`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Template
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleDuplicate}
                    disabled={duplicateTemplateMutation.isPending}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Template
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Template
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <TestTube className="mr-2 h-4 w-4" />
                    Send Test Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                HTML and text content of the email template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* HTML Content */}
              <div>
                <h4 className="font-medium mb-2">HTML Content</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {template.htmlContent}
                  </pre>
                </div>
              </div>

              {/* Text Content */}
              {template.textContent && (
                <div>
                  <h4 className="font-medium mb-2">Plain Text Content</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {template.textContent}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {!statsLoading && usageStats ? (
            <div className="grid gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Email delivery and engagement statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {usageStats.totalSent}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Sent
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {usageStats.deliveryRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Delivered
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {usageStats.openRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Opened
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {usageStats.clickRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Clicked
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Usage */}
              {usageStats.recentEmails &&
                usageStats.recentEmails.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Usage</CardTitle>
                      <CardDescription>
                        Latest emails sent using this template
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {usageStats.recentEmails.map((email) => (
                          <div
                            key={email.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {email.recipientEmail}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(email.sentAt)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                email.status === "DELIVERED"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                email.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {email.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {statsLoading
                      ? "Loading analytics..."
                      : "No usage data available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              email template &quot;{template.name}&quot; and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTemplateMutation.isPending}
            >
              {deleteTemplateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Template"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-html-link-for-pages */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Copy,
  TestTube,
  Code,
  FileText,
  Settings,
  Plus,
  Loader2,
  AlertTriangle,
  Info,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Import TanStack Query hooks
import {
  useEmailTemplate,
  useUpdateEmailTemplate,
  usePreviewEmailTemplate,
  useDuplicateEmailTemplate,
  useTemplateUsageStats,
} from "@/hooks/use-communication";
import {
  UpdateEmailTemplateDto,
  EmailTemplateCategory,
  emailTemplateCategoryEnum,
} from "@/lib/communications/dto/email-template.dto";

// Updated interface to match Next.js app router structure
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface TemplateFormData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: EmailTemplateCategory;
  isActive: boolean;
  variables: string[];
}

interface TemplateSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  priority: "high" | "normal" | "low";
}

const availableVariables = [
  { name: "customerName", description: "Customer's full name" },
  { name: "customerEmail", description: "Customer's email address" },
  { name: "orderNumber", description: "Order number" },
  { name: "companyName", description: "Your company name" },
  { name: "approvalLink", description: "Link to approval page" },
  { name: "expiryDate", description: "When approval expires" },
  { name: "productName", description: "Product being ordered" },
  { name: "quantity", description: "Order quantity" },
  { name: "totalAmount", description: "Order total amount" },
  { name: "designUrl", description: "Link to design preview" },
  { name: "supportEmail", description: "Support email address" },
  { name: "phoneNumber", description: "Support phone number" },
];

const categoryOptions = [
  { value: "DESIGN_APPROVAL_REQUEST", label: "Design Approval Request" },
  { value: "DESIGN_APPROVED", label: "Design Approved" },
  { value: "DESIGN_REJECTED", label: "Design Rejected" },
  { value: "ORDER_CONFIRMATION", label: "Order Confirmation" },
  { value: "ORDER_STATUS_UPDATE", label: "Order Status Update" },
  { value: "SHIPPING_NOTIFICATION", label: "Shipping Notification" },
  { value: "PAYMENT_CONFIRMATION", label: "Payment Confirmation" },
  { value: "CUSTOM", label: "Custom" },
];

export default function TemplateEditPage({ params }: PageProps) {
  const router = useRouter();

  // State to hold the resolved params
  const [templateId, setTemplateId] = useState<string>("");
  const [paramsLoaded, setParamsLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState("content");
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    subject: "",
    htmlContent: "",
    textContent: "",
    category: "CUSTOM",
    isActive: true,
    variables: [],
  });

  const [settings, setSettings] = useState<TemplateSettings>({
    trackOpens: true,
    trackClicks: true,
    priority: "normal",
  });

  // Resolve async params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setTemplateId(resolvedParams.id);
        setParamsLoaded(true);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };

    resolveParams();
  }, [params]);

  // TanStack Query hooks - only run when params are loaded
  const {
    data: template,
    isLoading,
    error,
  } = useEmailTemplate(templateId, paramsLoaded);

  const { data: usageStats, isLoading: statsLoading } = useTemplateUsageStats(
    templateId,
    paramsLoaded
  );

  const updateTemplateMutation = useUpdateEmailTemplate();
  const previewEmailMutation = usePreviewEmailTemplate();
  const duplicateTemplateMutation = useDuplicateEmailTemplate();

  // Initialize form data when template loads
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent || "",
        category: template.category,
        isActive: template.isActive,
        variables: template.variables,
      });

      // Initialize settings if available in template data
      if (
        "trackOpens" in template ||
        "trackClicks" in template ||
        "priority" in template
      ) {
        setSettings({
          trackOpens: (template as any).trackOpens ?? true,
          trackClicks: (template as any).trackClicks ?? true,
          priority: (template as any).priority ?? "normal",
        });
      }
    }
  }, [template]);

  // Helper function to update form data
  const updateFormData = (updates: Partial<TemplateFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateSettings = (key: keyof TemplateSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById(
      "template-content"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = formData.htmlContent;
      const newContent =
        currentContent.substring(0, start) +
        `{${variableName}}` +
        currentContent.substring(end);

      updateFormData({ htmlContent: newContent });

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variableName.length + 2,
          start + variableName.length + 2
        );
      }, 0);
    }
  };

  const handlePreview = async () => {
    if (!template) return;

    try {
      await previewEmailMutation.mutateAsync({
        templateId: template.id,
        variables: {
          customerName: "John Doe",
          customerEmail: "john@example.com",
          orderNumber: "ORD-2024-001",
          companyName: "Your Company",
          approvalLink: "https://yoursite.com/approve/abc123",
          expiryDate: "January 20, 2024 at 5:00 PM",
          productName: "Custom T-Shirt",
          quantity: 50,
          totalAmount: "$485.00",
        },
        deviceType: "desktop",
      });
      setShowPreview(true);
    } catch (error) {
      console.error("Error previewing template:", error);
    }
  };

  const handleSubmit = async () => {
    if (!template) return;

    try {
      const updateData: UpdateEmailTemplateDto = {
        name: formData.name,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        textContent: formData.textContent || undefined,
        category: formData.category,
        isActive: formData.isActive,
        variables: formData.variables,
      };

      await updateTemplateMutation.mutateAsync({
        templateId: template.id,
        values: updateData,
      });

      setHasChanges(false);
      router.push("/dashboard/admin/communication/approval/templates");
    } catch (error) {
      console.error("Error updating template:", error);
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

  // Show loading skeleton while params are being resolved or data is loading
  if (!paramsLoaded || isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Failed to load template. Please check if the template exists and try
            again.
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
              <a href="/dashboard/admin/communication/approval/templates">
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Email Template
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{template.name}</Badge>
            {template.isSystem && <Badge variant="default">System</Badge>}
            {usageStats && (
              <span className="text-sm text-muted-foreground">
                Used {usageStats.totalSent} times
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateTemplateMutation.isPending}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>

          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={previewEmailMutation.isPending}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewEmailMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Previewing...
              </>
            ) : showPreview ? (
              "Hide Preview"
            ) : (
              "Preview"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="variables">
                <Code className="h-4 w-4 mr-2" />
                Variables
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Configure the template name, subject, and category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={formData.name}
                        onChange={(e) =>
                          updateFormData({ name: e.target.value })
                        }
                        placeholder="e.g., Gentle Reminder"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          updateFormData({
                            category: value as EmailTemplateCategory,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        updateFormData({ subject: e.target.value })
                      }
                      placeholder="Subject line with variables like {orderNumber}"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use variables in curly braces like {"{orderNumber}"} or{" "}
                      {"{customerName}"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                  <CardDescription>
                    Write the email body using variables for personalization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template-content">HTML Content</Label>
                    <Textarea
                      id="template-content"
                      value={formData.htmlContent}
                      onChange={(e) =>
                        updateFormData({ htmlContent: e.target.value })
                      }
                      placeholder="Write your email content here..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="textContent">
                      Plain Text Content (Optional)
                    </Label>
                    <Textarea
                      id="textContent"
                      value={formData.textContent}
                      onChange={(e) =>
                        updateFormData({ textContent: e.target.value })
                      }
                      placeholder="Plain text version of your email..."
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Fallback for email clients that don&apos;t support HTML
                    </p>
                  </div>

                  {/* Quick Variable Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium">Quick Insert:</span>
                    {["customerName", "orderNumber", "approvalLink"].map(
                      (variable) => (
                        <Button
                          key={variable}
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => insertVariable(variable)}
                        >
                          {"{" + variable + "}"}
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {showPreview && previewEmailMutation.data && (
                <Card>
                  <CardHeader>
                    <CardTitle>Email Preview</CardTitle>
                    <CardDescription>
                      How the email will look with sample data
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
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                  <CardDescription>
                    Configure how this template behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Active Template</h4>
                      <p className="text-sm text-muted-foreground">
                        Make this template available for use
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        updateFormData({ isActive: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Track Email Opens</h4>
                      <p className="text-sm text-muted-foreground">
                        Track when customers open emails
                      </p>
                    </div>
                    <Switch
                      checked={settings.trackOpens}
                      onCheckedChange={(checked) =>
                        updateSettings("trackOpens", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Track Link Clicks</h4>
                      <p className="text-sm text-muted-foreground">
                        Track when customers click links
                      </p>
                    </div>
                    <Switch
                      checked={settings.trackClicks}
                      onCheckedChange={(checked) =>
                        updateSettings("trackClicks", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="priority">Email Priority</Label>
                    <Select
                      value={settings.priority}
                      onValueChange={(value) =>
                        updateSettings("priority", value)
                      }
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Variables</CardTitle>
                  <CardDescription>
                    Click any variable to insert it into your template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableVariables.map((variable) => (
                      <div
                        key={variable.name}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => insertVariable(variable.name)}
                      >
                        <div>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {"{" + variable.name + "}"}
                          </code>
                          <p className="text-sm text-muted-foreground mt-1">
                            {variable.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Alert className="mt-6 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Variables are automatically replaced with actual values
                      when emails are sent. Make sure to use the exact variable
                      names shown above.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Category:</span>
                <Badge variant="outline">
                  {
                    categoryOptions.find((c) => c.value === formData.category)
                      ?.label
                  }
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={formData.isActive ? "default" : "outline"}>
                  {formData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {usageStats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Times Used:</span>
                    <span className="text-sm font-medium">
                      {usageStats.totalSent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Delivery Rate:</span>
                    <span className="text-sm font-medium">
                      {usageStats.deliveryRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Open Rate:</span>
                    <span className="text-sm font-medium">
                      {usageStats.openRate}%
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm">Created:</span>
                <span className="text-sm font-medium">
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Modified:</span>
                <span className="text-sm font-medium">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={!hasChanges || updateTemplateMutation.isPending}
                >
                  {updateTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Template...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>

              {!hasChanges && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Make changes to enable saving
                </p>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Use clear, friendly language</p>
              <p>• Include all necessary variables</p>
              <p>• Test with preview feature</p>
              <p>• Keep subject lines under 50 characters</p>
              <p>• Always include approval links</p>
              <p>• Provide plain text fallback</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

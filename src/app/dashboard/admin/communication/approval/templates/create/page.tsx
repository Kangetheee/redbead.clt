/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-html-link-for-pages */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  FileText,
  Settings,
  Plus,
  Loader2,
  AlertTriangle,
  Info,
  TestTube,
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

// Import TanStack Query hooks
import {
  useCreateEmailTemplate,
  usePreviewEmailTemplate,
} from "@/hooks/use-communication";
import {
  CreateEmailTemplateDto,
  EmailTemplateCategory,
} from "@/lib/communications/dto/email-template.dto";

interface TemplateFormData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
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
  { name: "customMessage", description: "Custom message from sender" },
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

const defaultTemplates = {
  DESIGN_APPROVAL_REQUEST: {
    subject: "Design Approval Needed - Order #{orderNumber}",
    htmlContent: `<h2>Hi {customerName},</h2>

<p>We're excited to move forward with your order <strong>#{orderNumber}</strong>!</p>

<p>We've prepared your design and would love for you to review and approve it. Please take a moment to check the preview and let us know if everything looks perfect.</p>

<div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
  <p><strong>Order Details:</strong></p>
  <ul>
    <li>Product: {productName}</li>
    <li>Quantity: {quantity}</li>
    <li>Total: {totalAmount}</li>
  </ul>
</div>

<p style="text-align: center; margin: 30px 0;">
  <a href="{approvalLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Review & Approve Design
  </a>
</p>

<p>If you have any questions or need changes, please don't hesitate to reach out to us.</p>

<p>Best regards,<br>
{companyName} Design Team</p>

<hr style="margin: 30px 0;">
<p style="font-size: 12px; color: #666;">
  This approval request will expire on {expiryDate}. Please respond before this date to avoid delays.
</p>`,
    textContent: `Hi {customerName},

We're excited to move forward with your order #{orderNumber}!

We've prepared your design and would love for you to review and approve it. Please visit {approvalLink} to check the preview and let us know if everything looks perfect.

Order Details:
- Product: {productName}
- Quantity: {quantity}
- Total: {totalAmount}

If you have any questions or need changes, please don't hesitate to reach out to us.

Best regards,
{companyName} Design Team

---
This approval request will expire on {expiryDate}. Please respond before this date to avoid delays.`,
  },
  ORDER_CONFIRMATION: {
    subject: "Order Confirmation - #{orderNumber}",
    htmlContent: `<h2>Thank you for your order, {customerName}!</h2>

<p>We've received your order and it's being processed. Here are the details:</p>

<div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
  <p><strong>Order #{orderNumber}</strong></p>
  <ul>
    <li>Product: {productName}</li>
    <li>Quantity: {quantity}</li>
    <li>Total: {totalAmount}</li>
  </ul>
</div>

<p>We'll send you updates as your order progresses through production.</p>

<p>Best regards,<br>
{companyName} Team</p>`,
    textContent: `Thank you for your order, {customerName}!

We've received your order and it's being processed. Here are the details:

Order #{orderNumber}
- Product: {productName}
- Quantity: {quantity}
- Total: {totalAmount}

We'll send you updates as your order progresses through production.

Best regards,
{companyName} Team`,
  },
};

export default function CreateTemplatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("content");
  const [showPreview, setShowPreview] = useState(false);

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

  // TanStack Query hooks
  const createTemplateMutation = useCreateEmailTemplate();
  const previewEmailMutation = usePreviewEmailTemplate();

  // Helper function to update form data
  const updateFormData = (updates: Partial<TemplateFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (key: keyof TemplateSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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

  const loadTemplate = (category: EmailTemplateCategory) => {
    const template =
      defaultTemplates[category as keyof typeof defaultTemplates];
    if (template) {
      updateFormData({
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
      });
    }
  };

  const extractVariables = (content: string): string[] => {
    const variableRegex = /{([^}]+)}/g;
    const matches = content.match(variableRegex);
    return matches ? matches.map((match) => match.slice(1, -1)) : [];
  };

  const handlePreview = async () => {
    if (!formData.name || !formData.htmlContent) return;

    try {
      // Create a temporary template for preview
      const variables = extractVariables(
        formData.htmlContent + formData.textContent
      );

      // Use sample data for preview
      const sampleVariables: Record<string, any> = {
        customerName: "John Doe",
        customerEmail: "john@example.com",
        orderNumber: "ORD-2024-001",
        companyName: "Your Company",
        approvalLink: "https://yoursite.com/approve/abc123",
        expiryDate: "January 20, 2024 at 5:00 PM",
        productName: "Custom T-Shirt",
        quantity: 50,
        totalAmount: "$485.00",
        supportEmail: "support@yourcompany.com",
        phoneNumber: "(555) 123-4567",
        customMessage: "Thank you for choosing us!",
      };

      // For preview, we'll render the content locally since we don't have a template ID yet
      let previewHtml = formData.htmlContent;
      let previewSubject = formData.subject;

      // Replace variables with sample data
      variables.forEach((variable) => {
        const value = sampleVariables[variable] || `{${variable}}`;
        previewHtml = previewHtml.replace(
          new RegExp(`{${variable}}`, "g"),
          value
        );
        previewSubject = previewSubject.replace(
          new RegExp(`{${variable}}`, "g"),
          value
        );
      });

      // Show preview (we'll simulate the preview response)
      setShowPreview(true);
    } catch (error) {
      console.error("Error previewing template:", error);
    }
  };

  const getPreviewContent = () => {
    const variables = extractVariables(formData.htmlContent + formData.subject);

    const sampleVariables: Record<string, any> = {
      customerName: "John Doe",
      customerEmail: "john@example.com",
      orderNumber: "ORD-2024-001",
      companyName: "Your Company",
      approvalLink: "https://yoursite.com/approve/abc123",
      expiryDate: "January 20, 2024 at 5:00 PM",
      productName: "Custom T-Shirt",
      quantity: 50,
      totalAmount: "$485.00",
      supportEmail: "support@yourcompany.com",
      phoneNumber: "(555) 123-4567",
      customMessage: "Thank you for choosing us!",
    };

    let previewHtml = formData.htmlContent;
    let previewSubject = formData.subject;

    variables.forEach((variable) => {
      const value = sampleVariables[variable] || `{${variable}}`;
      previewHtml = previewHtml.replace(
        new RegExp(`{${variable}}`, "g"),
        value
      );
      previewSubject = previewSubject.replace(
        new RegExp(`{${variable}}`, "g"),
        value
      );
    });

    return { htmlContent: previewHtml, subject: previewSubject };
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      return;
    }

    try {
      const variables = extractVariables(
        formData.htmlContent + formData.textContent + formData.subject
      );

      const templateData: CreateEmailTemplateDto = {
        name: formData.name,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        textContent: formData.textContent || undefined,
        variables: Array.from(new Set(variables)), // Remove duplicates
        category: formData.category,
        isActive: formData.isActive,
      };

      await createTemplateMutation.mutateAsync(templateData);
      router.push("/dashboard/admin/communication/approval/templates");
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const isFormValid = formData.name && formData.subject && formData.htmlContent;

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
              Create Email Template
            </h1>
          </div>
          <p className="text-muted-foreground">
            Create a new email template for your communications
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!isFormValid}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Hide Preview" : "Preview"}
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
                        onValueChange={(value) => {
                          const category = value as EmailTemplateCategory;
                          updateFormData({ category });
                          loadTemplate(category);
                        }}
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Selecting a category will load a default template
                      </p>
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
              {showPreview && (
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
                            {getPreviewContent().subject}
                          </p>
                        </div>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: getPreviewContent().htmlContent,
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
                        Make this template available for use immediately
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
                      when emails are sent. Variables will be auto-detected from
                      your content.
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
              <CardTitle>Template Status</CardTitle>
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
              <div className="flex justify-between">
                <span className="text-sm">Variables:</span>
                <span className="text-sm font-medium">
                  {
                    extractVariables(
                      formData.htmlContent +
                        formData.textContent +
                        formData.subject
                    ).length
                  }
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
                  disabled={!isFormValid || createTemplateMutation.isPending}
                >
                  {createTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Template...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Template
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

              {!isFormValid && (
                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Please fill in all required fields: name, subject, and HTML
                    content.
                  </AlertDescription>
                </Alert>
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
              <p>• Always provide plain text fallback</p>
              <p>• Use HTML for better formatting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

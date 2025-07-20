/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Copy,
  Download,
  Upload,
  AlertTriangle,
  Info,
  Plus,
  X,
  Code,
  FileText,
  Mail,
  Settings,
  TestTube,
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
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Select } from "@radix-ui/react-select";
import { Switch } from "@radix-ui/react-switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { Button } from "react-day-picker";
import { Label } from "recharts";

// Mock template data
const mockTemplate = {
  id: "1",
  name: "Gentle Reminder",
  subject: "Design Approval Needed - Order #{orderNumber}",
  type: "APPROVAL_REQUEST",
  isDefault: true,
  isActive: true,
  content: `Hi {customerName},

We're excited to move forward with your order #{orderNumber}! 

We've prepared your design and would love for you to review and approve it. Please take a moment to check the preview and let us know if everything looks perfect.

You can review and approve your design by clicking the link below:
{approvalLink}

If you have any questions or need changes, please don't hesitate to reach out to us.

Best regards,
{companyName} Design Team

---
This approval request will expire on {expiryDate}`,
  variables: [
    {
      name: "customerName",
      description: "Customer's full name",
      required: true,
    },
    {
      name: "orderNumber",
      description: "Order number (e.g. ORD-2024-001)",
      required: true,
    },
    { name: "companyName", description: "Your company name", required: false },
    {
      name: "approvalLink",
      description: "Link to approval page",
      required: true,
    },
    {
      name: "expiryDate",
      description: "When approval expires",
      required: false,
    },
  ],
  settings: {
    autoSend: true,
    trackOpens: true,
    trackClicks: true,
    allowReplies: true,
    priority: "normal",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  usageCount: 245,
};

const templateTypes = [
  { value: "APPROVAL_REQUEST", label: "Approval Request" },
  { value: "APPROVAL_REMINDER", label: "Reminder" },
  { value: "APPROVAL_FINAL", label: "Final Notice" },
  { value: "APPROVAL_CONFIRMED", label: "Confirmation" },
];

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
];

export default function EditTemplatePage() {
  const [template, setTemplate] = useState(mockTemplate);
  const [activeTab, setActiveTab] = useState("content");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Helper function to update template state
  const updateTemplate = (updates) => {
    setTemplate((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateSettings = (key, value) => {
    setTemplate((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
    setHasChanges(true);
  };

  const insertVariable = (variableName) => {
    const textarea = document.getElementById("template-content");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = template.content;
      const newContent =
        currentContent.substring(0, start) +
        `{${variableName}}` +
        currentContent.substring(end);

      updateTemplate({ content: newContent });

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

  const getPreviewContent = () => {
    return template.content
      .replace(/{customerName}/g, "John Doe")
      .replace(/{customerEmail}/g, "john@example.com")
      .replace(/{orderNumber}/g, "ORD-2024-001")
      .replace(/{companyName}/g, "Your Company")
      .replace(/{approvalLink}/g, "https://yoursite.com/approve/abc123")
      .replace(/{expiryDate}/g, "January 20, 2024 at 5:00 PM")
      .replace(/{productName}/g, "Custom T-Shirt")
      .replace(/{quantity}/g, "50")
      .replace(/{totalAmount}/g, "$485.00");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Updating template:", template);

      setHasChanges(false);
      // Redirect back to templates list
      window.location.href =
        "/dashboard/admin/communication/approvals/templates";
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestEmail = () => {
    console.log("Sending test email with template:", template.id);
    // In real app, would send test email
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <a
              href="/dashboard/admin/communication/approvals/templates"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </a>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Email Template
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{template.name}</Badge>
            {template.isDefault && <Badge variant="default">Default</Badge>}
            <span className="text-sm text-gray-600">
              Used {template.usageCount} times
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestEmail}>
            <TestTube className="mr-2 h-4 w-4" />
            Send Test
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
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
              <TabsTrigger
                value="content"
                onClick={setActiveTab}
                isActive={activeTab === "content"}
              >
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                onClick={setActiveTab}
                isActive={activeTab === "settings"}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger
                value="variables"
                onClick={setActiveTab}
                isActive={activeTab === "variables"}
              >
                <Code className="h-4 w-4 mr-2" />
                Variables
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" activeTab={activeTab}>
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Configure the template name, subject, and type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="templateName">Template Name</Label>
                        <Input
                          id="templateName"
                          value={template.name}
                          onChange={(e) =>
                            updateTemplate({ name: e.target.value })
                          }
                          placeholder="e.g., Gentle Reminder"
                        />
                      </div>
                      <div>
                        <Label htmlFor="templateType">Template Type</Label>
                        <Select
                          value={template.type}
                          onValueChange={(value) =>
                            updateTemplate({ type: value })
                          }
                        >
                          {templateTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={template.subject}
                        onChange={(e) =>
                          updateTemplate({ subject: e.target.value })
                        }
                        placeholder="Subject line with variables like {orderNumber}"
                      />
                      <p className="text-xs text-gray-600 mt-1">
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
                      <Label htmlFor="template-content">Message Body</Label>
                      <Textarea
                        id="template-content"
                        value={template.content}
                        onChange={(e) =>
                          updateTemplate({ content: e.target.value })
                        }
                        placeholder="Write your email content here..."
                        rows={12}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Use variables from the sidebar to personalize your
                        message
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
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="bg-white rounded p-4 shadow-sm">
                          <div className="border-b pb-3 mb-4">
                            <p className="text-sm text-gray-600">Subject:</p>
                            <p className="font-medium">
                              {template.subject
                                .replace(/{orderNumber}/g, "ORD-2024-001")
                                .replace(/{customerName}/g, "John Doe")}
                            </p>
                          </div>
                          <div className="whitespace-pre-line text-sm">
                            {getPreviewContent()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" activeTab={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Template Settings</CardTitle>
                  <CardDescription>
                    Configure how this template behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Active Template</h4>
                        <p className="text-sm text-gray-600">
                          Make this template available for use
                        </p>
                      </div>
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={(checked) =>
                          updateTemplate({ isActive: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Default Template</h4>
                        <p className="text-sm text-gray-600">
                          Use as default for this template type
                        </p>
                      </div>
                      <Switch
                        checked={template.isDefault}
                        onCheckedChange={(checked) =>
                          updateTemplate({ isDefault: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Track Email Opens</h4>
                        <p className="text-sm text-gray-600">
                          Track when customers open emails
                        </p>
                      </div>
                      <Switch
                        checked={template.settings.trackOpens}
                        onCheckedChange={(checked) =>
                          updateSettings("trackOpens", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Track Link Clicks</h4>
                        <p className="text-sm text-gray-600">
                          Track when customers click links
                        </p>
                      </div>
                      <Switch
                        checked={template.settings.trackClicks}
                        onCheckedChange={(checked) =>
                          updateSettings("trackClicks", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Allow Replies</h4>
                        <p className="text-sm text-gray-600">
                          Allow customers to reply to emails
                        </p>
                      </div>
                      <Switch
                        checked={template.settings.allowReplies}
                        onCheckedChange={(checked) =>
                          updateSettings("allowReplies", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="priority">Email Priority</Label>
                      <Select
                        value={template.settings.priority}
                        onValueChange={(value) =>
                          updateSettings("priority", value)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variables Tab */}
            <TabsContent value="variables" activeTab={activeTab}>
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
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => insertVariable(variable.name)}
                      >
                        <div>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {"{" + variable.name + "}"}
                          </code>
                          <p className="text-sm text-gray-600 mt-1">
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
                <span className="text-sm">Type:</span>
                <Badge variant="outline">
                  {templateTypes.find((t) => t.value === template.type)?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={template.isActive ? "success" : "outline"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Times Used:</span>
                <span className="text-sm font-medium">
                  {template.usageCount}
                </span>
              </div>
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
                  disabled={!hasChanges || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
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
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>

              {!hasChanges && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Make changes to enable saving
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Template
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                View Usage History
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Use clear, friendly language</p>
              <p>• Include all necessary variables</p>
              <p>• Test with sample data first</p>
              <p>• Keep subject lines under 50 characters</p>
              <p>• Always include approval links</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

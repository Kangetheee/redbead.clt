/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Clock,
  X,
  Plus,
  Upload,
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Import TanStack Query hooks
import {
  useEmailLog,
  useEmailTemplates,
  useUpdateEmailTemplate,
  useSendEmail,
} from "@/hooks/use-communication";
import { EmailTemplateCategory } from "@/lib/communications/dto/email-template.dto";

interface EditApprovalPageProps {
  approvalId: string;
}

interface ApprovalFormData {
  customerEmail: string;
  customerName: string;
  expiresAt: string;
  emailTemplate: string;
  customMessage: string;
  autoReminders: boolean;
  reminderSchedule: number[]; // Hours before expiry
  previewImages: Array<{
    url: string;
    name: string;
    file?: File;
  }>;
}

function EditApprovalSkeleton() {
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function EditApprovalPage({
  approvalId,
}: EditApprovalPageProps) {
  const router = useRouter();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ApprovalFormData>({
    customerEmail: "",
    customerName: "",
    expiresAt: "",
    emailTemplate: "",
    customMessage: "",
    autoReminders: true,
    reminderSchedule: [24, 12],
    previewImages: [],
  });

  // TanStack Query hooks
  const {
    data: emailLog,
    isLoading: emailLogLoading,
    error: emailLogError,
  } = useEmailLog(approvalId);

  const { data: templatesData, isLoading: templatesLoading } =
    useEmailTemplates({
      category: "DESIGN_APPROVAL_REQUEST",
      isActive: true,
    });

  const updateTemplateMutation = useUpdateEmailTemplate();
  const sendEmailMutation = useSendEmail();

  const templates = templatesData?.items || [];

  // Initialize form data when email log loads
  useEffect(() => {
    if (emailLog) {
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 3); // 3 days from now

      setFormData({
        customerEmail: emailLog.recipientEmail,
        customerName: emailLog.recipientName || "",
        expiresAt: defaultExpiryDate.toISOString().slice(0, 16), // Format for datetime-local input
        emailTemplate: emailLog.templateId,
        customMessage: "",
        autoReminders: true,
        reminderSchedule: [24, 12],
        previewImages: [],
      });
    }
  }, [emailLog]);

  // Helper function to update form data
  const updateFormData = (updates: Partial<ApprovalFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Helper function to format dates for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          previewImages: [
            ...prev.previewImages,
            {
              url: e.target?.result as string,
              name: file.name,
              file: file,
            },
          ],
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreviewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const handleReminderScheduleChange = (index: number, value: string) => {
    const newSchedule = [...formData.reminderSchedule];
    newSchedule[index] = parseInt(value) || 0;
    updateFormData({ reminderSchedule: newSchedule });
  };

  const addReminderTime = () => {
    updateFormData({
      reminderSchedule: [...formData.reminderSchedule, 6],
    });
  };

  const removeReminderTime = (index: number) => {
    const newSchedule = formData.reminderSchedule.filter((_, i) => i !== index);
    updateFormData({ reminderSchedule: newSchedule });
  };

  const handleSubmit = async () => {
    if (!emailLog) return;

    setIsSubmitting(true);

    try {
      await sendEmailMutation.mutateAsync({
        templateId: formData.emailTemplate,
        recipientEmail: formData.customerEmail,
        recipientName: formData.customerName,
        variables: {
          customMessage: formData.customMessage,
          expiryDate: new Date(formData.expiresAt).toLocaleDateString(),
        },
        orderId: emailLog.orderId,
        priority: "normal",
        trackOpens: true,
        trackClicks: true,
      });

      setHasChanges(false);
      router.push(`/dashboard/admin/communication/approvals/${approvalId}`);
    } catch (error) {
      console.error("Error updating approval:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailLogLoading || templatesLoading) {
    return <EditApprovalSkeleton />;
  }

  if (emailLogError || !emailLog) {
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

  const isExpired =
    emailLog.status === "FAILED" || emailLog.status === "BOUNCED";
  const canEdit = !isExpired;

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/admin/communication/approvals/${approvalId}`}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Approval Settings
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {emailLog.orderId || "Unknown Order"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formData.customerName} • {formData.customerEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Restrictions Alert */}
      {!canEdit && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This approval request has failed or bounced and cannot be edited.
            Consider creating a new approval request.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the core details of the approval request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      updateFormData({ customerEmail: e.target.value })
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      updateFormData({ customerName: e.target.value })
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date & Time</Label>
                <Input
                  id="expiryDate"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    updateFormData({ expiresAt: e.target.value })
                  }
                  disabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When the approval request will expire
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Design Preview Images */}
          <Card>
            <CardHeader>
              <CardTitle>Design Preview Images</CardTitle>
              <CardDescription>
                Update the images shown to the customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      Upload additional images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </label>
                </div>
              )}

              {formData.previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removePreviewImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.previewImages.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No preview images uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure the email template and custom message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Select
                  value={formData.emailTemplate}
                  onValueChange={(value) =>
                    updateFormData({ emailTemplate: value })
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  value={formData.customMessage}
                  onChange={(e) =>
                    updateFormData({ customMessage: e.target.value })
                  }
                  placeholder="Add a personal message to include with the approval request..."
                  rows={4}
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminder Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Reminder Settings</CardTitle>
              <CardDescription>
                Configure automatic reminder emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Auto Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically send reminder emails before expiry
                  </p>
                </div>
                <Switch
                  checked={formData.autoReminders}
                  onCheckedChange={(checked) =>
                    updateFormData({ autoReminders: checked })
                  }
                  disabled={!canEdit}
                />
              </div>

              {formData.autoReminders && (
                <div className="space-y-3">
                  <Label>Reminder Schedule (hours before expiry)</Label>
                  <div className="space-y-2">
                    {formData.reminderSchedule.map((hours, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={hours}
                          onChange={(e) =>
                            handleReminderScheduleChange(index, e.target.value)
                          }
                          min="1"
                          max="168"
                          className="w-24"
                          disabled={!canEdit}
                        />
                        <span className="text-sm text-muted-foreground">
                          hours before
                        </span>
                        {canEdit && formData.reminderSchedule.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReminderTime(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {canEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addReminderTime}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Reminder Time
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Status:</span>
                <Badge
                  variant="outline"
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
              <div className="flex justify-between">
                <span className="text-sm">Order:</span>
                <span className="text-sm font-medium">
                  {emailLog.orderId || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Template:</span>
                <span className="text-sm font-medium">
                  {emailLog.templateName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sent:</span>
                <span className="text-sm font-medium">
                  {emailLog.sentAt
                    ? new Date(emailLog.sentAt).toLocaleDateString()
                    : "Not sent"}
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
                  disabled={!canEdit || !hasChanges || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>

              {!hasChanges && canEdit && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Make changes to enable saving
                </p>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Set reasonable expiry times</p>
              <p>• Use clear, high-quality preview images</p>
              <p>• Schedule reminders strategically</p>
              <p>• Personalize messages when appropriate</p>
              <p>• Test template changes before saving</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

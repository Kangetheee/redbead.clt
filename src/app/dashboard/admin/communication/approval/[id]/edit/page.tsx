/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Clock,
  Mail,
  Calendar,
  X,
  Plus,
  Upload,
  Eye,
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
import { Select } from "@radix-ui/react-select";
import { Switch } from "@radix-ui/react-switch";
import { Button } from "react-day-picker";
import { Label } from "recharts";

// Mock approval data
const mockApproval = {
  id: "1",
  orderNumber: "ORD-2024-001",
  status: "PENDING",
  customerEmail: "john@example.com",
  customerName: "John Doe",
  designSummary: {
    productName: "Custom T-Shirt",
    quantity: 50,
    material: "Cotton",
  },
  previewImages: ["/images/preview1.jpg", "/images/preview2.jpg"],
  expiresAt: "2024-01-18T10:00:00Z",
  emailTemplate: "gentle",
  customMessage: "",
  autoReminders: true,
  reminderSchedule: [24, 12], // Hours before expiry
  metadata: {},
};

const emailTemplates = [
  { id: "gentle", name: "Gentle Reminder" },
  { id: "urgent", name: "Urgent Follow-up" },
  { id: "final", name: "Final Notice" },
];

export default function EditApprovalPage() {
  const [approval, setApproval] = useState(mockApproval);
  const [previewImages, setPreviewImages] = useState(approval.previewImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper function to update approval state
  const updateApproval = (updates) => {
    setApproval((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Helper function to format dates for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages((prev) => [...prev, e.target.result]);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreviewImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real app, would call API to update approval
      console.log("Updating approval:", {
        ...approval,
        previewImages,
      });

      setHasChanges(false);
      // Redirect back to approval details
      window.location.href = `/dashboard/admin/communication/approvals/${approval.id}`;
    } catch (error) {
      console.error("Error updating approval:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReminderScheduleChange = (index, value) => {
    const newSchedule = [...approval.reminderSchedule];
    newSchedule[index] = parseInt(value);
    updateApproval({ reminderSchedule: newSchedule });
  };

  const addReminderTime = () => {
    updateApproval({
      reminderSchedule: [...approval.reminderSchedule, 6],
    });
  };

  const removeReminderTime = (index) => {
    const newSchedule = approval.reminderSchedule.filter((_, i) => i !== index);
    updateApproval({ reminderSchedule: newSchedule });
  };

  const isExpired = new Date(approval.expiresAt) < new Date();
  const canEdit = approval.status === "PENDING" && !isExpired;

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <a
              href={`/dashboard/admin/communication/approvals/${approval.id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </a>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Approval Settings
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{approval.orderNumber}</Badge>
            <span className="text-sm text-gray-600">
              {approval.customerName} • {approval.customerEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Restrictions Alert */}
      {!canEdit && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {approval.status !== "PENDING"
              ? "This approval request has already been responded to and cannot be edited."
              : "This approval request has expired and cannot be edited."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
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
                      value={approval.customerEmail}
                      onChange={(e) =>
                        updateApproval({ customerEmail: e.target.value })
                      }
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={approval.customerName}
                      onChange={(e) =>
                        updateApproval({ customerName: e.target.value })
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
                    value={formatDateForInput(approval.expiresAt)}
                    onChange={(e) =>
                      updateApproval({
                        expiresAt: new Date(e.target.value).toISOString(),
                      })
                    }
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-gray-600 mt-1">
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        Upload additional images
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </label>
                  </div>
                )}

                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                          <img
                            src={image}
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
                    value={approval.emailTemplate}
                    onValueChange={(value) =>
                      updateApproval({ emailTemplate: value })
                    }
                    disabled={!canEdit}
                  >
                    {emailTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customMessage">
                    Custom Message (Optional)
                  </Label>
                  <Textarea
                    id="customMessage"
                    value={approval.customMessage}
                    onChange={(e) =>
                      updateApproval({ customMessage: e.target.value })
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
                    <p className="text-sm text-gray-600">
                      Automatically send reminder emails before expiry
                    </p>
                  </div>
                  <Switch
                    checked={approval.autoReminders}
                    onCheckedChange={(checked) =>
                      updateApproval({ autoReminders: checked })
                    }
                    disabled={!canEdit}
                  />
                </div>

                {approval.autoReminders && (
                  <div className="space-y-3">
                    <Label>Reminder Schedule (hours before expiry)</Label>
                    <div className="space-y-2">
                      {approval.reminderSchedule.map((hours, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={hours}
                            onChange={(e) =>
                              handleReminderScheduleChange(
                                index,
                                e.target.value
                              )
                            }
                            min="1"
                            max="168"
                            className="w-24"
                            disabled={!canEdit}
                          />
                          <span className="text-sm text-gray-600">
                            hours before
                          </span>
                          {canEdit && approval.reminderSchedule.length > 1 && (
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
                  <Badge variant="outline">{approval.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Order:</span>
                  <span className="text-sm font-medium">
                    {approval.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Product:</span>
                  <span className="text-sm font-medium">
                    {approval.designSummary.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quantity:</span>
                  <span className="text-sm font-medium">
                    {approval.designSummary.quantity}
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
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
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
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                </div>

                {!hasChanges && canEdit && (
                  <p className="text-xs text-gray-600 mt-2 text-center">
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
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Set reasonable expiry times</p>
                <p>• Use clear, high-quality preview images</p>
                <p>• Schedule reminders strategically</p>
                <p>• Personalize messages when appropriate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

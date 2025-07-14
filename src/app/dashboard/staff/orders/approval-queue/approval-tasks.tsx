/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  Download,
  Upload,
  MessageSquare,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Image,
  Edit,
  Copy,
  Phone,
  Mail,
  ExternalLink,
  Zap,
  Timer,
  Flag,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { useAddOrderNote } from "@/hooks/use-orders";

interface ApprovalTaskProps {
  order: OrderResponse;
  onTaskCompleted?: () => void;
  compact?: boolean;
}

interface ApprovalAction {
  id: string;
  type: "REMIND" | "ESCALATE" | "EXTEND" | "CANCEL";
  label: string;
  description: string;
  icon: React.ElementType;
  variant?: "default" | "outline" | "destructive";
}

interface ReminderTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  tone: "gentle" | "urgent" | "final";
}

const APPROVAL_ACTIONS: ApprovalAction[] = [
  {
    id: "remind",
    type: "REMIND",
    label: "Send Reminder",
    description: "Send a follow-up reminder to the customer",
    icon: Send,
    variant: "default",
  },
  {
    id: "escalate",
    type: "ESCALATE",
    label: "Escalate",
    description: "Escalate to supervisor or sales team",
    icon: Flag,
    variant: "outline",
  },
  {
    id: "extend",
    type: "EXTEND",
    label: "Extend Deadline",
    description: "Give customer more time to review",
    icon: Timer,
    variant: "outline",
  },
  {
    id: "cancel",
    type: "CANCEL",
    label: "Cancel Request",
    description: "Cancel the approval request",
    icon: XCircle,
    variant: "destructive",
  },
];

const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "gentle",
    name: "Gentle Reminder",
    subject: "Design Review Requested - Order #{orderNumber}",
    content: `Hi there!

We hope you're doing well. We wanted to follow up on the design approval for your recent order #{orderNumber}.

We've prepared the design mockups for your review and would appreciate your feedback when you have a chance. This helps us ensure everything meets your expectations before we begin production.

You can review and approve the designs by clicking the link in your original email or by visiting your order details.

If you have any questions or need any changes, please don't hesitate to reach out.

Best regards,
Design Team`,
    tone: "gentle",
  },
  {
    id: "urgent",
    name: "Urgent Follow-up",
    subject: "Urgent: Design Approval Needed - Order #{orderNumber}",
    content: `Hello,

We need your urgent attention regarding the design approval for order #{orderNumber}.

To keep your order on schedule, we need your approval within the next 24 hours. Without your confirmation, we may experience delays in production and delivery.

Please review the attached designs and let us know:
• ✅ Approve as-is
• 🔄 Request changes (please specify)
• ❌ Reject (please provide feedback)

You can respond directly to this email or use the approval link in your order details.

For immediate assistance, please call us at [phone number].

Thank you for your prompt response.

Production Team`,
    tone: "urgent",
  },
  {
    id: "final",
    name: "Final Notice",
    subject: "Final Notice: Design Approval Required - Order #{orderNumber}",
    content: `Dear Customer,

This is our final reminder regarding the design approval for order #{orderNumber}.

IMPORTANT: If we don't receive your approval by [deadline], we will need to:
• Put your order on hold
• Apply potential delay charges
• Reschedule production timeline

To avoid any issues:
1. Review the designs immediately
2. Provide your approval or feedback
3. Contact us if you need assistance

We value your business and want to ensure your order meets your expectations. Please respond as soon as possible.

For urgent matters, please call us directly.

Best regards,
Customer Service Team`,
    tone: "final",
  },
];

export default function ApprovalTask({
  order,
  onTaskCompleted,
  compact = false,
}: ApprovalTaskProps) {
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(
    null
  );
  const [reminderTemplate, setReminderTemplate] =
    useState<ReminderTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [extensionDays, setExtensionDays] = useState(3);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const addOrderNote = useAddOrderNote(order.id);

  if (!order.designApproval || order.designApproval.status !== "PENDING") {
    return null;
  }

  const timeElapsed =
    new Date().getTime() - new Date(order.designApproval.requestedAt).getTime();
  const hoursElapsed = Math.floor(timeElapsed / (1000 * 60 * 60));
  const isOverdue = hoursElapsed > 24;
  const isUrgent =
    hoursElapsed > 12 ||
    (order.urgencyLevel && ["RUSH", "EMERGENCY"].includes(order.urgencyLevel));

  const getUrgencyColor = () => {
    if (isOverdue) return "text-red-600 bg-red-50 border-red-200";
    if (isUrgent) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getSuggestedAction = () => {
    if (isOverdue) return APPROVAL_ACTIONS.find((a) => a.type === "ESCALATE");
    if (isUrgent) return APPROVAL_ACTIONS.find((a) => a.type === "REMIND");
    return null;
  };

  const getSuggestedTemplate = () => {
    if (isOverdue) return REMINDER_TEMPLATES.find((t) => t.tone === "final");
    if (isUrgent) return REMINDER_TEMPLATES.find((t) => t.tone === "urgent");
    return REMINDER_TEMPLATES.find((t) => t.tone === "gentle");
  };

  const handleExecuteAction = async () => {
    if (!selectedAction) return;

    setIsSending(true);

    try {
      let noteContent = "";
      let noteTitle = "";

      switch (selectedAction.type) {
        case "REMIND":
          noteTitle = "Reminder Sent";
          noteContent = `Design approval reminder sent to customer.${reminderTemplate ? ` Template: ${reminderTemplate.name}` : ""}${customMessage ? ` Custom message: ${customMessage}` : ""}`;
          break;

        case "ESCALATE":
          noteTitle = "Issue Escalated";
          noteContent = `Design approval escalated to supervisor. Reason: ${escalationReason}`;
          break;

        case "EXTEND":
          noteTitle = "Deadline Extended";
          noteContent = `Design approval deadline extended by ${extensionDays} days.`;
          break;

        case "CANCEL":
          noteTitle = "Approval Request Cancelled";
          noteContent = "Design approval request has been cancelled.";
          break;
      }

      await addOrderNote.mutateAsync({
        noteType: "DESIGN_APPROVAL",
        title: noteTitle,
        content: noteContent,
        isInternal: true,
        priority: selectedAction.type === "ESCALATE" ? "HIGH" : undefined,
      });

      // Simulate action execution
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onTaskCompleted?.();
      setShowActionDialog(false);
      setSelectedAction(null);
      setCustomMessage("");
      setEscalationReason("");
    } catch (error) {
      console.error("Failed to execute action:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (compact) {
    return (
      <Card
        className={`border-l-4 ${isOverdue ? "border-l-red-500" : isUrgent ? "border-l-orange-500" : "border-l-blue-500"}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Design Approval Pending</h4>
              <p className="text-sm text-muted-foreground">
                Waiting{" "}
                {formatDistanceToNow(
                  new Date(order.designApproval.requestedAt),
                  { addSuffix: true }
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
              {isUrgent && !isOverdue && (
                <Badge
                  variant="outline"
                  className="border-orange-500 text-orange-600"
                >
                  Urgent
                </Badge>
              )}

              <Dialog
                open={showActionDialog}
                onOpenChange={setShowActionDialog}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Action
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approval Action</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedAction(
                          APPROVAL_ACTIONS.find((a) => a.type === "REMIND")!
                        );
                        handleExecuteAction();
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className={`border-2 ${getUrgencyColor()}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Design Approval Pending
                </h2>
                <p className="text-muted-foreground">
                  Order #{order.orderNumber} • Waiting for customer response
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOverdue && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}

              {isUrgent && !isOverdue && (
                <Badge
                  variant="outline"
                  className="border-orange-500 text-orange-600"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}

              {order.urgencyLevel &&
                ["RUSH", "EMERGENCY"].includes(order.urgencyLevel) && (
                  <Badge variant="destructive">{order.urgencyLevel}</Badge>
                )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{hoursElapsed}h</p>
              <p className="text-sm text-muted-foreground">Waiting Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {format(new Date(order.designApproval.requestedAt), "MMM dd")}
              </p>
              <p className="text-sm text-muted-foreground">Requested</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {order.designApproval.expiresAt
                  ? Math.max(
                      0,
                      Math.floor(
                        (new Date(order.designApproval.expiresAt).getTime() -
                          Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )
                  : "∞"}
              </p>
              <p className="text-sm text-muted-foreground">Days Left</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Action */}
      {getSuggestedAction() && (
        <Alert
          className={
            isOverdue
              ? "border-red-200 bg-red-50"
              : "border-orange-200 bg-orange-50"
          }
        >
          <AlertTriangle
            className={`h-4 w-4 ${isOverdue ? "text-red-600" : "text-orange-600"}`}
          />
          <AlertDescription
            className={isOverdue ? "text-red-800" : "text-orange-800"}
          >
            <div className="flex items-center justify-between">
              <div>
                <strong>Suggested action:</strong> This approval has been
                pending for {hoursElapsed} hours. Consider{" "}
                {getSuggestedAction()?.label.toLowerCase()}.
              </div>
              <Button
                size="sm"
                variant={isOverdue ? "destructive" : "outline"}
                onClick={() => {
                  setSelectedAction(getSuggestedAction()!);
                  setReminderTemplate(getSuggestedTemplate()!);
                  setShowActionDialog(true);
                }}
              >
                {getSuggestedAction()?.label}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Approval Details</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="history">Communication History</TabsTrigger>
        </TabsList>

        {/* Approval Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {order.customerId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Customer {order.customerId}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderItems.length} items • $
                      {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Customer
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Customer Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Approval Requested</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(order.designApproval.requestedAt),
                          "MMM dd, yyyy 'at' hh:mm a"
                        )}
                      </p>
                    </div>
                  </div>

                  {order.designApproval.expiresAt && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Expires</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(order.designApproval.expiresAt),
                            "MMM dd, yyyy 'at' hh:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pl-11">
                    <Progress
                      value={Math.min(100, (hoursElapsed / 72) * 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {hoursElapsed} hours elapsed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Design Assets</CardTitle>
              <CardDescription>
                Files and materials sent for customer approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4" />
                    <span className="font-medium text-sm">Design Mockup 1</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Specifications</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-sm">Proof Copy</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Actions</CardTitle>
              <CardDescription>
                Choose an action to take regarding this pending approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {APPROVAL_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedAction(action);
                        if (action.type === "REMIND") {
                          setReminderTemplate(getSuggestedTemplate()!);
                        }
                        setShowActionDialog(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{action.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">SYS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">System</p>
                      <Badge variant="outline" className="text-xs">
                        Automated
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Design approval request sent to customer
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(
                        new Date(order.designApproval.requestedAt),
                        "MMM dd, yyyy 'at' hh:mm a"
                      )}
                    </p>
                  </div>
                </div>

                {/* Placeholder for additional communication history */}
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                  <p>No additional communication yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAction?.label}</DialogTitle>
            <DialogDescription>{selectedAction?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAction?.type === "REMIND" && (
              <>
                <div>
                  <Label>Reminder Template</Label>
                  <Select
                    value={reminderTemplate?.id || ""}
                    onValueChange={(value) => {
                      const template = REMINDER_TEMPLATES.find(
                        (t) => t.id === value
                      );
                      setReminderTemplate(template || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {template.tone} tone
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reminderTemplate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <p className="text-sm font-medium mb-1">
                      Subject:{" "}
                      {reminderTemplate.subject.replace(
                        "{orderNumber}",
                        order.orderNumber
                      )}
                    </p>
                    <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {reminderTemplate.content.replace(
                        "{orderNumber}",
                        order.orderNumber
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="customMessage">
                    Additional Message (Optional)
                  </Label>
                  <Textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add any custom message..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {selectedAction?.type === "ESCALATE" && (
              <div>
                <Label htmlFor="escalationReason">Escalation Reason</Label>
                <Textarea
                  id="escalationReason"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Explain why this needs to be escalated..."
                  rows={4}
                />
              </div>
            )}

            {selectedAction?.type === "EXTEND" && (
              <div>
                <Label htmlFor="extensionDays">Extension Period</Label>
                <Select
                  value={extensionDays.toString()}
                  onValueChange={(value) => setExtensionDays(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteAction}
              disabled={
                isSending ||
                (selectedAction?.type === "ESCALATE" &&
                  !escalationReason.trim())
              }
              variant={selectedAction?.variant}
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedAction &&
                    React.createElement(selectedAction.icon, {
                      className: "h-4 w-4 mr-2",
                    })}
                  {selectedAction?.label}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

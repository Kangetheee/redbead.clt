/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Type,
  Plus,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";

// Form validation schema
const emailTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(500, "Subject must be less than 500 characters"),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  category: z.enum([
    "DESIGN_APPROVAL_REQUEST",
    "DESIGN_APPROVED",
    "DESIGN_REJECTED",
    "ORDER_CONFIRMATION",
    "ORDER_STATUS_UPDATE",
    "SHIPPING_NOTIFICATION",
    "PAYMENT_CONFIRMATION",
    "CUSTOM",
  ]),
  isActive: z.boolean().default(true),
  variables: z.array(z.string()).default([]),
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

const CATEGORY_OPTIONS = [
  { value: "DESIGN_APPROVAL_REQUEST", label: "Design Approval Request" },
  { value: "DESIGN_APPROVED", label: "Design Approved" },
  { value: "DESIGN_REJECTED", label: "Design Rejected" },
  { value: "ORDER_CONFIRMATION", label: "Order Confirmation" },
  { value: "ORDER_STATUS_UPDATE", label: "Order Status Update" },
  { value: "SHIPPING_NOTIFICATION", label: "Shipping Notification" },
  { value: "PAYMENT_CONFIRMATION", label: "Payment Confirmation" },
  { value: "CUSTOM", label: "Custom" },
];

const COMMON_VARIABLES = [
  "customerName",
  "customerEmail",
  "orderNumber",
  "orderDate",
  "totalAmount",
  "productName",
  "quantity",
  "trackingNumber",
  "trackingUrl",
  "approvalLink",
  "expiryDate",
  "companyName",
  "orderUrl",
];

const VARIABLE_DESCRIPTIONS = {
  customerName: "Customer's full name",
  customerEmail: "Customer's email address",
  orderNumber: "Order number (e.g., ORD-2024-0001)",
  orderDate: "Order creation date",
  totalAmount: "Order total amount",
  productName: "Product name",
  quantity: "Order quantity",
  trackingNumber: "Shipping tracking number",
  trackingUrl: "Tracking URL link",
  approvalLink: "Design approval link",
  expiryDate: "Approval expiry date",
  companyName: "Company name",
  orderUrl: "Direct link to order details",
};

export default function CreateEmailTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newVariable, setNewVariable] = useState("");

  const form = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: "",
      subject: "",
      htmlContent: "",
      textContent: "",
      category: "CUSTOM",
      isActive: true,
      variables: [],
    },
  });

  const watchedVariables = form.watch("variables");
  const watchedHtmlContent = form.watch("htmlContent");
  const watchedSubject = form.watch("subject");

  const onSubmit = async (data: EmailTemplateFormData) => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch('/api/email-templates', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      toast.success("Email template created successfully");

      router.push("/admin/email-templates");
    } catch (error) {
      toast.error("Failed to create email template");
    } finally {
      setIsLoading(false);
    }
  };

  const addVariable = (variable: string) => {
    const currentVariables = form.getValues("variables");
    if (!currentVariables.includes(variable)) {
      form.setValue("variables", [...currentVariables, variable]);
    }
  };

  const removeVariable = (variable: string) => {
    const currentVariables = form.getValues("variables");
    form.setValue(
      "variables",
      currentVariables.filter((v) => v !== variable)
    );
  };

  const addCustomVariable = () => {
    if (newVariable && !watchedVariables.includes(newVariable)) {
      addVariable(newVariable);
      setNewVariable("");
    }
  };

  const insertVariableAtCursor = (
    variable: string,
    field: "subject" | "htmlContent"
  ) => {
    const currentValue = form.getValues(field);
    const variableText = `{{${variable}}}`;

    // Simple insertion at the end - in a real implementation, you'd want to track cursor position
    form.setValue(field, currentValue + variableText);
    addVariable(variable);
  };

  const renderPreview = () => {
    let content = watchedHtmlContent;
    let subject = watchedSubject;

    // Replace variables with sample data for preview
    const sampleData = {
      customerName: "John Doe",
      customerEmail: "john.doe@example.com",
      orderNumber: "ORD-2024-0001",
      orderDate: "January 15, 2024",
      totalAmount: "$299.99",
      productName: "Custom Printed Lanyard",
      quantity: "50",
      trackingNumber: "1Z999AA10123456784",
      trackingUrl: "https://ups.com/track",
      approvalLink: "https://app.example.com/approve/abc123",
      expiryDate: "January 22, 2024",
      companyName: "Acme Corp",
      orderUrl: "https://app.example.com/orders/123",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    return { content, subject };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Email Template
          </h1>
          <p className="text-muted-foreground">
            Create a new email template for automated communications
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter template name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Template
                          </FormLabel>
                          <FormDescription>
                            Enable this template for use in automated emails
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Email Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">
                        <Code className="h-4 w-4 mr-2" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter email subject (use {{variable}} for dynamic content)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Use variables like {{ customerName }} or{" "}
                              {{ orderNumber }} for dynamic content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="htmlContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTML Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter HTML email content..."
                                className="min-h-[300px] font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Write HTML content for the email. Use{" "}
                              {{ variable }} syntax for dynamic content.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="textContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plain Text Content (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter plain text version..."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Plain text fallback for email clients that
                              don&apos;t support HTML
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="mb-4 pb-4 border-b">
                          <div className="text-sm text-muted-foreground mb-1">
                            Subject:
                          </div>
                          <div className="font-medium">
                            {renderPreview().subject || "No subject"}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Content:
                        </div>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html:
                              renderPreview().content ||
                              '<p class="text-muted-foreground">No content</p>',
                          }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Variables Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Variables
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Template Variables</DialogTitle>
                          <DialogDescription>
                            Variables are placeholders that get replaced with
                            actual data when the email is sent. Use the format{" "}
                            {{ variableName }} in your content.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          {Object.entries(VARIABLE_DESCRIPTIONS).map(
                            ([variable, description]) => (
                              <div
                                key={variable}
                                className="flex justify-between items-start gap-2"
                              >
                                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                                  {variable}
                                </code>
                                <span className="text-sm text-muted-foreground text-right">
                                  {description}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Used Variables */}
                  {watchedVariables.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        Used Variables
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {watchedVariables.map((variable) => (
                          <Badge
                            key={variable}
                            variant="secondary"
                            className="text-xs"
                          >
                            {variable}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeVariable(variable)}
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Variables */}
                  <div>
                    <Label className="text-sm font-medium">
                      Common Variables
                    </Label>
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      {COMMON_VARIABLES.map((variable) => (
                        <Button
                          key={variable}
                          variant="ghost"
                          size="sm"
                          className="justify-start h-auto py-1 px-2 text-xs"
                          onClick={() => addVariable(variable)}
                          disabled={watchedVariables.includes(variable)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {variable}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Variable */}
                  <div>
                    <Label className="text-sm font-medium">
                      Add Custom Variable
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="variableName"
                        value={newVariable}
                        onChange={(e) => setNewVariable(e.target.value)}
                        className="text-xs"
                        onKeyPress={(e) =>
                          e.key === "Enter" && addCustomVariable()
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addCustomVariable}
                        disabled={
                          !newVariable || watchedVariables.includes(newVariable)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Template
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
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

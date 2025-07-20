"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Package,
  Image as ImageIcon,
  MessageSquare,
  Save,
  Send,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

interface DesignApproval {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  designSummary: {
    productName: string;
    quantity: number;
    material?: string;
    colors?: string[];
    dimensions?: string;
    specialInstructions?: string;
  };
  previewImages: string[];
  requestedAt: string;
  expiresAt: string;
  approvalToken: string;
  metadata?: {
    rushOrder?: boolean;
    specialInstructions?: string;
  };
}

type DecisionType = "approve" | "reject" | "";

export default function DesignApprovalReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [approval, setApproval] = useState<DesignApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<DecisionType>("");
  const [comments, setComments] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchApproval = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        const mockApproval: DesignApproval = {
          id: params.id as string,
          orderId: "ord-001",
          orderNumber: "ORD-2024-0001",
          customerName: "John Doe",
          customerEmail: "john.doe@example.com",
          status: "PENDING",
          designSummary: {
            productName: "Custom Polyester Lanyard",
            quantity: 100,
            material: "Polyester",
            colors: ["Blue", "White"],
            dimensions: "15mm x 900mm",
            specialInstructions: "Logo must be centered with high resolution",
          },
          previewImages: [
            "/api/placeholder/600/400",
            "/api/placeholder/600/400",
            "/api/placeholder/600/400",
          ],
          requestedAt: "2024-01-15T10:30:00.000Z",
          expiresAt: "2024-01-18T10:30:00.000Z",
          approvalToken: "da_token_abc123xyz",
          metadata: {
            rushOrder: true,
            specialInstructions: "Customer needs this for event on Jan 20th",
          },
        };

        setApproval(mockApproval);
      } catch (error) {
        console.error("Error fetching design approval:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApproval();
  }, [params.id]);

  const handleSubmitDecision = async () => {
    if (!decision || !approval) return;

    setSubmitting(true);
    try {
      // API call to update approval status
      const updateData = {
        status: decision === "approve" ? "APPROVED" : "REJECTED",
        rejectionReason: decision === "reject" ? comments : undefined,
        approvedBy: "Admin User", // Replace with actual admin user info
      };

      console.log("Submitting decision:", updateData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect back to approval details
      router.push(`/admin/design-approvals/${approval.id}`);
    } catch (error) {
      console.error("Error submitting decision:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    decision &&
    (decision === "approve" || (decision === "reject" && comments.trim()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Design Approval Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The design approval you&apos;re looking for doesn&apos;t exist or has
          been removed.
        </p>
        <Button asChild>
          <Link href="/admin/design-approvals">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Design Approvals
          </Link>
        </Button>
      </div>
    );
  }

  if (approval.status !== "PENDING") {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Approval Already Processed
        </h2>
        <p className="text-gray-600 mb-4">
          This design approval has already been {approval.status.toLowerCase()}.
        </p>
        <Button asChild>
          <Link href={`/admin/design-approvals/${approval.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approval Details
          </Link>
        </Button>
      </div>
    );
  }

  const isExpired = new Date(approval.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/design-approvals/${approval.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Review Design Approval
            </h1>
            <p className="text-gray-600">
              Order {approval.orderNumber} - {approval.customerName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-100 text-yellow-800">
            <span className="flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>PENDING REVIEW</span>
            </span>
          </Badge>

          {approval.metadata?.rushOrder && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Rush Order
            </Badge>
          )}
        </div>
      </div>

      {/* Expired Alert */}
      {isExpired && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This approval request has expired. Any decision made here will be
            processed as an admin override.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Customer & Order Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {approval.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="font-semibold text-lg">
                      {approval.customerName}
                    </h3>
                    <p className="text-gray-600">{approval.customerEmail}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <Link
                      href={`/admin/orders/${approval.orderId}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {approval.orderNumber}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">
                    Requested:{" "}
                    {format(
                      new Date(approval.requestedAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Details */}
          <Card>
            <CardHeader>
              <CardTitle>Design Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <p className="text-gray-900 font-medium">
                    {approval.designSummary.productName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <p className="text-gray-900">
                    {approval.designSummary.quantity} units
                  </p>
                </div>

                {approval.designSummary.material && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Material
                    </label>
                    <p className="text-gray-900">
                      {approval.designSummary.material}
                    </p>
                  </div>
                )}

                {approval.designSummary.dimensions && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dimensions
                    </label>
                    <p className="text-gray-900">
                      {approval.designSummary.dimensions}
                    </p>
                  </div>
                )}

                {approval.designSummary.colors && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Colors
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      {approval.designSummary.colors.map((color, index) => (
                        <Badge key={index} variant="outline">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {approval.designSummary.specialInstructions && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Special Instructions
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                      <p className="text-gray-900">
                        {approval.designSummary.specialInstructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Design Previews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Design Previews</span>
              </CardTitle>
              <CardDescription>
                Review these design previews to make your approval decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approval.previewImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image}
                      alt={`Design preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 bg-white bg-opacity-90 rounded-full p-3">
                        <ImageIcon className="w-6 h-6 text-gray-700" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                      Preview {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Review Decision</span>
              </CardTitle>
              <CardDescription>
                Make a decision on behalf of the customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Decision Radio Group */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Your Decision
                </label>
                <RadioGroup
                  value={decision}
                  onValueChange={(value) => setDecision(value as DecisionType)}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 transition-colors">
                    <RadioGroupItem value="approve" id="approve" />
                    <Label
                      htmlFor="approve"
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          Approve Design
                        </p>
                        <p className="text-sm text-green-600">
                          The design meets requirements and can proceed to
                          production
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-red-50 transition-colors">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label
                      htmlFor="reject"
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">
                          Reject Design
                        </p>
                        <p className="text-sm text-red-600">
                          The design needs changes before it can be approved
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Comments Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Comments{" "}
                  {decision === "reject" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <Textarea
                  placeholder={
                    decision === "approve"
                      ? "Optional: Add comments about the approval..."
                      : decision === "reject"
                        ? "Required: Explain what changes are needed..."
                        : "Add your comments here..."
                  }
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className={
                    decision === "reject" && !comments.trim()
                      ? "border-red-300"
                      : ""
                  }
                />
                {decision === "reject" && !comments.trim() && (
                  <p className="text-sm text-red-600 mt-1">
                    Comments are required when rejecting a design
                  </p>
                )}
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                onClick={handleSubmitDecision}
                disabled={!isFormValid || submitting}
                className="w-full"
                variant={
                  decision === "approve"
                    ? "default"
                    : decision === "reject"
                      ? "destructive"
                      : "outline"
                }
              >
                {submitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {decision === "approve"
                      ? "Approve Design"
                      : decision === "reject"
                        ? "Reject Design"
                        : "Submit Decision"}
                  </>
                )}
              </Button>

              {/* Action Notes */}
              {decision && (
                <Alert
                  className={
                    decision === "approve"
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {decision === "approve"
                      ? "The customer will be notified that their design has been approved and the order will proceed to production."
                      : "The customer will be notified that changes are required and can resubmit their design."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Order Context */}
          <Card>
            <CardHeader>
              <CardTitle>Order Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Value</span>
                <span className="font-medium">$299.00</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer Type</span>
                <Badge variant="outline">Regular</Badge>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rush Order</span>
                <Badge
                  className={
                    approval.metadata?.rushOrder
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {approval.metadata?.rushOrder ? "Yes" : "No"}
                </Badge>
              </div>

              {approval.metadata?.specialInstructions && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    Special Instructions
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                    {approval.metadata.specialInstructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <Image
              src={selectedImage}
              alt="Design preview"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white hover:bg-gray-100"
              onClick={() => setSelectedImage(null)}
            >
              ✕ Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

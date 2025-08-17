"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  ArrowRight,
  AlertCircle,
  Home,
} from "lucide-react";
import Link from "next/link";
import {
  useApproveDesignViaToken,
  useRejectDesignViaToken,
} from "@/hooks/use-orders";

interface DesignApprovalClientProps {
  token: string;
  action: "approve" | "reject";
}

export function DesignApprovalClient({
  token,
  action,
}: DesignApprovalClientProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const approveDesign = useApproveDesignViaToken();
  const rejectDesign = useRejectDesignViaToken();

  // Validate token format (should be 64 characters)
  const isValidToken = token && token.length === 64;

  useEffect(() => {
    // Auto-approve if it's an approve action and valid token
    if (action === "approve" && isValidToken && !hasSubmitted) {
      handleApprove();
    }
  }, [action, isValidToken, hasSubmitted]);

  const handleApprove = async () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    approveDesign.mutate(token);
  };

  const handleReject = async () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    rejectDesign.mutate({
      token,
      reason: rejectionReason.trim() || undefined,
    });
  };

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  Invalid Approval Link
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  The design approval link you clicked appears to be invalid or
                  may have expired.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Please check your email for the correct link or contact us
                    for assistance.
                  </p>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (approveDesign.isSuccess || rejectDesign.isSuccess) {
    const isApproved = approveDesign.isSuccess;
    const response = approveDesign.data || rejectDesign.data;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {isApproved ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-orange-500" />
                  )}
                </div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  {isApproved
                    ? "Design Approved!"
                    : "Design Feedback Submitted"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    Order #{response?.orderNumber}
                  </Badge>
                  <p className="text-muted-foreground">
                    {response?.message ||
                      (isApproved
                        ? "Thank you for approving the design! Your order will now proceed to production."
                        : "Thank you for your feedback. Our design team will review your comments and create a revised design.")}
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">What happens next?</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {isApproved ? (
                      <>
                        <p>✓ Your design has been approved</p>
                        <p>• Order moves to production queue</p>
                        <p>• You&apos;ll receive shipping notifications</p>
                      </>
                    ) : (
                      <>
                        <p>✓ Your feedback has been recorded</p>
                        <p>• Design team will create revisions</p>
                        <p>• You&apos;ll receive a new approval email</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Return to Homepage
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (approveDesign.isError || rejectDesign.isError) {
    const error = approveDesign.error || rejectDesign.error;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  {error?.message ||
                    "We encountered an error processing your response. This link may have expired or already been used."}
                </p>

                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-red-800 dark:text-red-400">
                    Common reasons:
                  </h3>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <p>• The approval link has expired</p>
                    <p>• You&apos;ve already responded to this request</p>
                    <p>• The order has been cancelled or modified</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Return to Homepage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading/Approval state
  if (action === "approve") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Clock className="h-16 w-16 text-green-500 animate-pulse" />
                </div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  Approving Design...
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Please wait while we process your design approval.
                </p>
                <div className="animate-pulse bg-muted h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Rejection form
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-50 dark:from-orange-950/20 dark:via-background dark:to-orange-950/20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-orange-500" />
              </div>
              <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">
                Provide Design Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                Help us improve the design by sharing what changes you&apos;d
                like to see.
              </p>

              <div className="space-y-4">
                <label htmlFor="reason" className="text-sm font-medium">
                  What would you like us to change? (Optional)
                </label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the changes you'd like to see in the design..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your feedback helps our design team create exactly what you
                  envision.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-orange-800 dark:text-orange-400">
                  What happens next?
                </h3>
                <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <p>• Our design team will review your feedback</p>
                  <p>
                    • We&apos;ll create a revised design based on your input
                  </p>
                  <p>
                    • You&apos;ll receive a new approval email with the updated
                    design
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleReject}
                  disabled={rejectDesign.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {rejectDesign.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Feedback <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

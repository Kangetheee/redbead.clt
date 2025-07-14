/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Printer,
  Camera,
  Upload,
  Download,
  Timer,
  Settings,
  User,
  MessageSquare,
  FileText,
  Zap,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  Edit,
  Flag,
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
import { Progress } from "@/components/ui/progress";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { OrderResponse } from "@/lib/orders/types/orders.types";
import { useUpdateOrderStatus, useAddOrderNote } from "@/hooks/use-orders";

interface ProcessOrderProps {
  order: OrderResponse;
  onOrderUpdated?: () => void;
  staffMember?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

interface ProductionStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "skipped";
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  assignee?: string;
  requirements?: string[];
  tools?: string[];
  qualityChecks?: string[];
  notes?: string;
  completedAt?: string;
  blockedReason?: string;
}

export default function ProcessOrder({
  order,
  onOrderUpdated,
  staffMember = {
    id: "staff-1",
    name: "Production Staff",
    role: "Production Operator",
  },
}: ProcessOrderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [stepNotes, setStepNotes] = useState("");
  const [qualityIssue, setQualityIssue] = useState("");
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const updateOrderStatus = useUpdateOrderStatus(order.id);
  const addOrderNote = useAddOrderNote(order.id);

  // Define production workflow based on order type
  const [productionSteps, setProductionSteps] = useState<ProductionStep[]>([
    {
      id: "design-review",
      title: "Design Review & Preparation",
      description:
        "Review design files, check specifications, and prepare materials list",
      status: "pending",
      estimatedDuration: 15,
      requirements: [
        "Design files",
        "Specifications document",
        "Material requirements",
      ],
      tools: ["Design software", "Material calculator"],
      qualityChecks: [
        "Design file quality",
        "Specification completeness",
        "Material availability",
      ],
    },
    {
      id: "material-prep",
      title: "Material Preparation",
      description: "Gather and prepare all required materials for production",
      status: "pending",
      estimatedDuration: 30,
      requirements: ["Material list", "Inventory access", "Quality materials"],
      tools: ["Material handling equipment", "Measuring tools"],
      qualityChecks: [
        "Material quality",
        "Correct quantities",
        "Color accuracy",
      ],
    },
    {
      id: "setup",
      title: "Production Setup",
      description: "Set up equipment and workspace for production",
      status: "pending",
      estimatedDuration: 20,
      requirements: [
        "Clean workspace",
        "Calibrated equipment",
        "Safety equipment",
      ],
      tools: ["Production equipment", "Calibration tools"],
      qualityChecks: [
        "Equipment calibration",
        "Workspace cleanliness",
        "Safety compliance",
      ],
    },
    {
      id: "production",
      title: "Production Process",
      description: "Execute the main production process for the order items",
      status: "pending",
      estimatedDuration: 120,
      requirements: [
        "Prepared materials",
        "Set up equipment",
        "Production instructions",
      ],
      tools: ["Printing equipment", "Cutting tools", "Assembly tools"],
      qualityChecks: [
        "Print quality",
        "Color accuracy",
        "Dimensional accuracy",
        "Finish quality",
      ],
    },
    {
      id: "quality-control",
      title: "Quality Control",
      description:
        "Perform comprehensive quality inspection of finished products",
      status: "pending",
      estimatedDuration: 25,
      requirements: [
        "Finished products",
        "Quality standards",
        "Inspection tools",
      ],
      tools: ["Measuring tools", "Color matching tools", "Quality checklist"],
      qualityChecks: [
        "Overall quality",
        "Specification compliance",
        "Customer requirements",
        "Packaging readiness",
      ],
    },
    {
      id: "packaging",
      title: "Packaging & Labeling",
      description: "Package products and prepare for shipping",
      status: "pending",
      estimatedDuration: 15,
      requirements: [
        "Quality-approved products",
        "Packaging materials",
        "Shipping labels",
      ],
      tools: ["Packaging equipment", "Label printer", "Protective materials"],
      qualityChecks: [
        "Packaging integrity",
        "Correct labeling",
        "Protection adequacy",
      ],
    },
  ]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isProcessing && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, sessionStartTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartStep = (stepIndex: number) => {
    const updatedSteps = [...productionSteps];
    updatedSteps[stepIndex].status = "in-progress";
    setProductionSteps(updatedSteps);
    setCurrentStep(stepIndex);
    setIsProcessing(true);
    setSessionStartTime(new Date());
    setElapsedTime(0);
  };

  const handlePauseStep = () => {
    setIsProcessing(false);
    setSessionStartTime(null);
  };

  const handleCompleteStep = async (stepIndex: number) => {
    const step = productionSteps[stepIndex];
    const updatedSteps = [...productionSteps];

    updatedSteps[stepIndex].status = "completed";
    updatedSteps[stepIndex].completedAt = new Date().toISOString();
    updatedSteps[stepIndex].actualDuration = Math.floor(elapsedTime / 60);
    updatedSteps[stepIndex].notes = stepNotes;

    setProductionSteps(updatedSteps);
    setIsProcessing(false);
    setSessionStartTime(null);
    setElapsedTime(0);
    setStepNotes("");

    // Add note about step completion
    try {
      await addOrderNote.mutateAsync({
        noteType: "PRODUCTION",
        title: `Completed: ${step.title}`,
        content: `Production step "${step.title}" completed successfully.${stepNotes ? ` Notes: ${stepNotes}` : ""}`,
        isInternal: true,
      });
    } catch (error) {
      console.error("Failed to add completion note:", error);
    }

    // Auto-advance to next step if available
    if (stepIndex < productionSteps.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // All steps completed - update order status
      try {
        await updateOrderStatus.mutateAsync({
          status: "SHIPPED", // or next appropriate status
          reason: "Production completed successfully",
        });
        onOrderUpdated?.();
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    }
  };

  const handleBlockStep = async (stepIndex: number) => {
    const updatedSteps = [...productionSteps];
    updatedSteps[stepIndex].status = "blocked";
    updatedSteps[stepIndex].blockedReason = blockReason;

    setProductionSteps(updatedSteps);
    setIsProcessing(false);
    setSessionStartTime(null);

    // Add note about blocking issue
    try {
      await addOrderNote.mutateAsync({
        noteType: "URGENCY",
        title: `Production Blocked: ${productionSteps[stepIndex].title}`,
        content: `Production step blocked. Reason: ${blockReason}`,
        isInternal: true,
        priority: "HIGH",
      });
    } catch (error) {
      console.error("Failed to add blocking note:", error);
    }

    setShowBlockDialog(false);
    setBlockReason("");
  };

  const handleReportQualityIssue = async () => {
    try {
      await addOrderNote.mutateAsync({
        noteType: "QUALITY",
        title: "Quality Issue Reported",
        content: qualityIssue,
        isInternal: true,
        priority: "HIGH",
      });

      setShowQualityDialog(false);
      setQualityIssue("");
    } catch (error) {
      console.error("Failed to report quality issue:", error);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Timer;
      case "blocked":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in-progress":
        return "text-blue-500";
      case "blocked":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = productionSteps.filter(
      (step) => step.status === "completed"
    ).length;
    return (completedSteps / productionSteps.length) * 100;
  };

  const currentStepData = productionSteps[currentStep];
  const isUrgentOrder =
    order.urgencyLevel && ["RUSH", "EMERGENCY"].includes(order.urgencyLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Production Workflow</h2>
              <p className="text-muted-foreground">
                Order #{order.orderNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isUrgentOrder && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  {order.urgencyLevel}
                </Badge>
              )}

              <Badge variant="outline">
                {Math.round(getProgressPercentage())}% Complete
              </Badge>
            </div>
          </div>

          <Progress value={getProgressPercentage()} className="mb-4" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {productionSteps.filter((s) => s.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isProcessing ? formatTime(elapsedTime) : "00:00"}
              </p>
              <p className="text-sm text-muted-foreground">Current Session</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {productionSteps.reduce(
                  (sum, step) => sum + (step.actualDuration || 0),
                  0
                )}{" "}
                min
              </p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStepData && (
        <Card
          className={`${currentStepData.status === "in-progress" ? "border-blue-500" : ""}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    currentStepData.status === "in-progress"
                      ? "bg-blue-100"
                      : currentStepData.status === "completed"
                        ? "bg-green-100"
                        : currentStepData.status === "blocked"
                          ? "bg-red-100"
                          : "bg-gray-100"
                  }`}
                >
                  {React.createElement(getStepIcon(currentStepData.status), {
                    className: `h-5 w-5 ${getStepColor(currentStepData.status)}`,
                  })}
                </div>

                <div>
                  <h3 className="font-semibold">{currentStepData.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {productionSteps.length} • Est.{" "}
                    {currentStepData.estimatedDuration} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentStepData.status === "pending" && (
                  <Button onClick={() => handleStartStep(currentStep)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Step
                  </Button>
                )}

                {currentStepData.status === "in-progress" && (
                  <>
                    <Button variant="outline" onClick={handlePauseStep}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>

                    <Button onClick={() => handleCompleteStep(currentStep)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </>
                )}

                {currentStepData.status === "blocked" && (
                  <Badge variant="destructive">Blocked</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="mb-4">{currentStepData.description}</p>

            {/* Step Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Requirements</h4>
                <ul className="text-sm space-y-1">
                  {currentStepData.requirements?.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Tools Needed</h4>
                <ul className="text-sm space-y-1">
                  {currentStepData.tools?.map((tool, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Quality Checks</h4>
                <ul className="text-sm space-y-1">
                  {currentStepData.qualityChecks?.map((check, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-purple-500 rounded-full" />
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step Notes */}
            {currentStepData.status === "in-progress" && (
              <div className="mt-4">
                <Label htmlFor="stepNotes" className="text-sm font-medium">
                  Step Notes (Optional)
                </Label>
                <Textarea
                  id="stepNotes"
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Add any notes about this step..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>

              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>

              <Dialog
                open={showQualityDialog}
                onOpenChange={setShowQualityDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Quality Issue</DialogTitle>
                    <DialogDescription>
                      Describe any quality concerns or issues with this step
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={qualityIssue}
                    onChange={(e) => setQualityIssue(e.target.value)}
                    placeholder="Describe the quality issue..."
                    rows={4}
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowQualityDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleReportQualityIssue}>
                      Report Issue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Block Step
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block Production Step</DialogTitle>
                    <DialogDescription>
                      Explain why this step cannot be completed currently
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Explain the blocking issue..."
                    rows={4}
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowBlockDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleBlockStep(currentStep)}
                    >
                      Block Step
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Production Steps</CardTitle>
          <CardDescription>
            Complete workflow for order #{order.orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {productionSteps.map((step, index) => {
              const Icon = getStepIcon(step.status);
              const color = getStepColor(step.status);

              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    index === currentStep ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Est. {step.estimatedDuration} min
                        {step.actualDuration &&
                          ` • Actual: ${step.actualDuration} min`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.status === "completed" && step.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(step.completedAt), "HH:mm")}
                      </span>
                    )}

                    <Badge
                      variant="outline"
                      className={
                        step.status === "completed"
                          ? "border-green-500 text-green-700"
                          : step.status === "in-progress"
                            ? "border-blue-500 text-blue-700"
                            : step.status === "blocked"
                              ? "border-red-500 text-red-700"
                              : ""
                      }
                    >
                      {step.status.replace("-", " ")}
                    </Badge>

                    {index !== currentStep && step.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentStep(index)}
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Staff Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={staffMember.avatar} />
              <AvatarFallback>
                {staffMember.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{staffMember.name}</p>
              <p className="text-sm text-muted-foreground">
                {staffMember.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

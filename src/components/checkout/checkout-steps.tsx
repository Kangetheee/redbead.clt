"use client";

import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  icon: React.ElementType;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowNavigation?: boolean;
}

export function CheckoutSteps({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}: CheckoutStepsProps) {
  const handleStepClick = (step: Step) => {
    // Only allow navigation to completed steps or if explicitly allowed
    if (onStepClick && (allowNavigation || step.id < currentStep)) {
      onStepClick(step.id);
    }
  };

  const isStepClickable = (step: Step) => {
    return onStepClick && (allowNavigation || step.id < currentStep);
  };

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={cn(
                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                "relative"
              )}
            >
              {step.id < currentStep ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-primary" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStepClick(step)}
                    disabled={!isStepClickable(step)}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full bg-primary",
                      isStepClickable(step)
                        ? "hover:bg-primary/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        : "cursor-default"
                    )}
                    aria-label={`Go to ${step.name}`}
                  >
                    <CheckCircle
                      className="h-5 w-5 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </button>
                  <span
                    className={cn(
                      "absolute top-10 left-1/2 -translate-x-1/2 text-sm font-medium text-primary",
                      isStepClickable(step) && "cursor-pointer"
                    )}
                    onClick={() =>
                      isStepClickable(step) && handleStepClick(step)
                    }
                  >
                    {step.name}
                  </span>
                </>
              ) : step.id === currentStep ? (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-muted" />
                  </div>
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white"
                    aria-current="step"
                  >
                    <step.icon
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Current step: {step.name}</span>
                  </div>
                  <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm font-medium text-primary">
                    {step.name}
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="h-0.5 w-full bg-muted" />
                  </div>
                  <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-white hover:border-muted-foreground">
                    <step.icon
                      className="h-5 w-5 text-muted-foreground group-hover:text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Upcoming step: {step.name}</span>
                  </div>
                  <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
                    {step.name}
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

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
}

export function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
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
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90">
                    <CheckCircle
                      className="h-5 w-5 text-primary-foreground"
                      aria-hidden="true"
                    />
                    <span className="sr-only">{step.name}</span>
                  </div>
                  <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm font-medium text-primary">
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
                    <span className="sr-only">{step.name}</span>
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
                    <span className="sr-only">{step.name}</span>
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

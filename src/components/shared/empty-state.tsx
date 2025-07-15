"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "plain";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
  variant = "plain",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
      spacing: "space-y-3",
    },
    md: {
      container: "py-12",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
      spacing: "space-y-4",
    },
    lg: {
      container: "py-16",
      icon: "h-20 w-20",
      title: "text-2xl",
      description: "text-lg",
      spacing: "space-y-6",
    },
  };

  const currentSize = sizeClasses[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        currentSize.container,
        currentSize.spacing,
        className
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center rounded-full bg-muted p-4">
          <Icon className={cn(currentSize.icon, "text-muted-foreground")} />
        </div>
      )}

      <div className="space-y-2">
        <h3 className={cn("font-semibold", currentSize.title)}>{title}</h3>
        {description && (
          <p
            className={cn(
              "text-muted-foreground max-w-md",
              currentSize.description
            )}
          >
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || "outline"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return <Card className={className}>{content}</Card>;
  }

  return content;
}

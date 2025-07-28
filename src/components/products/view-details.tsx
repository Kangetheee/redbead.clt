"use client";

import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ViewDetailsButtonProps {
  productSlug: string; // Make required since we need it for navigation
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  fullWidth?: boolean;
  external?: boolean; // Opens in new tab
  disabled?: boolean;
}

export function ViewDetailsButton({
  productSlug,
  variant = "outline",
  size = "default",
  className,
  children,
  showIcon = true,
  fullWidth = false,
  external = false,
  disabled = false,
}: ViewDetailsButtonProps) {
  const href = `/products/${productSlug}`;

  const buttonContent = (
    <>
      {showIcon && <Eye className="h-4 w-4 mr-2" />}
      {children || "View Details"}
      {external && <ExternalLink className="h-3 w-3 ml-1" />}
    </>
  );

  const buttonProps = {
    variant,
    size,
    disabled,
    className: cn(fullWidth && "w-full", className),
  };

  if (external) {
    return (
      <Button {...buttonProps} asChild>
        <Link href={href} target="_blank" rel="noopener noreferrer">
          {buttonContent}
        </Link>
      </Button>
    );
  }

  return (
    <Button {...buttonProps} asChild>
      <Link href={href}>{buttonContent}</Link>
    </Button>
  );
}

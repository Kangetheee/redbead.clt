/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ViewDetailsButtonProps {
  productSlug?: string;
  productId?: string;
  href?: string; // Custom URL override
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  fullWidth?: boolean;
  external?: boolean; // Opens in new tab
}

export function ViewDetailsButton({
  productSlug,
  productId,
  href,
  variant = "outline",
  size = "default",
  className,
  children,
  showIcon = true,
  fullWidth = false,
  external = false,
}: ViewDetailsButtonProps) {
  // Determine the URL to use
  const getHref = () => {
    if (href) return href;
    if (productSlug) return `/products/${productSlug}`;
    if (productId) return `/products/${productId}`;
    return "/products";
  };

  const finalHref = getHref();
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
    className: cn(fullWidth && "w-full", className),
  };

  if (external) {
    return (
      <Button {...buttonProps} asChild>
        <Link
          href={`/products/${productSlug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonContent}
        </Link>
      </Button>
    );
  }

  return (
    <Button {...buttonProps} asChild>
      <Link href={`/products/${productSlug}`}>{buttonContent}</Link>
    </Button>
  );
}

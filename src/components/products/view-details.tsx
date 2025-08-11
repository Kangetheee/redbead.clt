import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewDetailsButtonProps {
  productId: string;
  productSlug?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ViewDetailsButton({
  productId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  productSlug,
  variant = "outline",
  size = "default",
  fullWidth = false,
  className,
  children = "View Details",
}: ViewDetailsButtonProps) {
  const href = `/products/${productId}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        fullWidth && "w-full",
        "border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30",
        className
      )}
      asChild
    >
      <Link href={href}>
        <Eye className="w-4 h-4 mr-2" />
        {children}
      </Link>
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ActionButtonsProps {
  primaryHref: string;
  primaryText: string;
  secondaryHref: string;
  secondaryText: string;
  variant?: "default" | "cta";
}

export function ActionButtons({
  primaryHref,
  primaryText,
  secondaryHref,
  secondaryText,
  variant = "default",
}: ActionButtonsProps) {
  const primaryStyles =
    variant === "cta"
      ? "bg-white text-green-600 hover:bg-gray-50 dark:bg-gray-100 dark:text-green-700 dark:hover:bg-white"
      : "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700";

  const secondaryStyles =
    variant === "cta"
      ? "border-white text-white hover:bg-white hover:text-green-600 dark:border-green-200 dark:text-green-100 dark:hover:bg-green-200 dark:hover:text-green-800"
      : "";

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" className={primaryStyles} asChild>
        <Link href={primaryHref}>
          {primaryText} <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" className={secondaryStyles} asChild>
        <Link href={secondaryHref}>{secondaryText}</Link>
      </Button>
    </div>
  );
}

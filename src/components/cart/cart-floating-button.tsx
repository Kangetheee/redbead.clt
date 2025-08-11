"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartItemCount, useCartTotalQuantity } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface CartFloatingButtonProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  showOnEmpty?: boolean;
}

export function CartFloatingButton({
  className,
  position = "bottom-right",
  showOnEmpty = false,
}: CartFloatingButtonProps) {
  const router = useRouter();
  const itemCount = useCartItemCount();
  const totalQuantity = useCartTotalQuantity();

  // Don't show if cart is empty and showOnEmpty is false
  if (!showOnEmpty && itemCount === 0) {
    return null;
  }

  const handleClick = () => {
    router.push("/cart");
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      <Button
        onClick={handleClick}
        size="lg"
        className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-green-600 hover:bg-green-700"
      >
        <ShoppingCart className="h-6 w-6" />

        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold">
            {totalQuantity > 99 ? "99+" : totalQuantity}
          </Badge>
        )}
      </Button>
    </div>
  );
}

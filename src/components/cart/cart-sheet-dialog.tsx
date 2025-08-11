import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useCartItemCount,
} from "@/hooks/use-cart";
import { CartItemResponse } from "@/lib/cart/types/cart.types";
import Link from "next/link";
import Image from "next/image";
import { cn, formatAmount } from "@/lib/utils";
// import { toast } from "sonner";

interface CartSheetProps {
  children?: React.ReactNode;
  showLabel?: boolean;
}

// Individual Cart Item Component
function CartItem({ item }: { item: CartItemResponse }) {
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    updateMutation.mutate({
      cartItemId: item.id,
      values: { quantity: newQuantity },
    });
  };

  const handleRemove = () => {
    removeMutation.mutate(item.id);
  };

  const isLoading = updateMutation.isPending || removeMutation.isPending;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 border-b border-border last:border-b-0",
        isLoading && "opacity-50"
      )}
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
        {item.product.thumbnailImage || item.product.images?.[0] ? (
          <Image
            src={item.product.thumbnailImage || item.product.images[0]}
            alt={item.product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">
          {item.product.name}
        </h4>

        {/* Variant Info */}
        <p className="text-xs text-muted-foreground mt-1">
          {item.variant.name}
          {item.variant.sku && ` • SKU: ${item.variant.sku}`}
        </p>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-2 space-y-1">
            {item.customizations.map((customization, index) => (
              <p key={index} className="text-xs text-muted-foreground">
                <span className="font-medium">
                  {customization.option.name}:
                </span>{" "}
                {customization.customValue ||
                  customization.option.metadata?.options?.find(
                    (opt) => opt.value === customization.valueId
                  )?.label ||
                  customization.valueId}
              </p>
            ))}
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isLoading || item.quantity >= item.variant.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {removeMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        <p className="font-medium text-sm text-foreground">
          {formatAmount(item.totalPrice)}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-muted-foreground">
            {formatAmount(item.unitPrice)} each
          </p>
        )}
      </div>
    </div>
  );
}

// Main Cart Sheet Component
export function CartSheet({ children, showLabel = false }: CartSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = useCartItemCount();
  const { data: cart, isLoading, error } = useCart();

  // Default trigger if no children provided
  const trigger = children || (
    <Button variant="ghost" size={showLabel ? "default" : "icon"}>
      <ShoppingCart className="h-5 w-5" />
      {showLabel && <span className="ml-2">Cart</span>}
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
      {showLabel && itemCount > 0 && (
        <span className="ml-1 text-muted-foreground">({itemCount})</span>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">{trigger}</div>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({itemCount})
          </SheetTitle>
          {itemCount > 0 && (
            <SheetDescription>
              Review your items before checkout
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Cart Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Failed to load cart items
              </p>
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add some products to get started
              </p>
              <Button asChild onClick={() => setIsOpen(false)}>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Subtotal ({cart.summary.totalQuantity} items)
                  </span>
                  <span className="font-medium">
                    KES {cart.summary.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatAmount(cart.summary.total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {cart?.items && cart.items.length > 0 && (
          <SheetFooter className="flex flex-col gap-2 pt-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button
              variant="outline"
              className="w-full"
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href="/cart" className="flex items-center gap-2">
                View Full Cart
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartSheet;

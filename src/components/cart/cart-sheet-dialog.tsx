import React, { useState, useRef, createContext, useContext } from "react";
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
import { ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import { useCart, useCartItemCount } from "@/hooks/use-cart";
import Link from "next/link";
import { formatAmount } from "@/lib/utils";
import { CartItem } from "./cart-item";

interface CartSheetProps {
  children?: React.ReactNode;
  showLabel?: boolean;
}

// Create context for cart sheet state
interface CartSheetContextType {
  isOpen: boolean;
  setUpdating: (updating: boolean) => void;
  closeSheet: () => void;
}

const CartSheetContext = createContext<CartSheetContextType | null>(null);

export const useCartSheet = () => {
  const context = useContext(CartSheetContext);
  if (!context) {
    throw new Error("useCartSheet must be used within CartSheet");
  }
  return context;
};

export function CartSheet({ children, showLabel = false }: CartSheetProps) {
  const itemCount = useCartItemCount();
  const { data: cart, isLoading, error } = useCart();

  const [open, setOpen] = useState(false);
  const isUpdatingRef = useRef(false);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing if we're updating items
    if (!newOpen && isUpdatingRef.current) {
      return;
    }
    setOpen(newOpen);
  };

  const sheetContext: CartSheetContextType = {
    isOpen: open,
    setUpdating: (updating: boolean) => {
      isUpdatingRef.current = updating;
    },
    closeSheet: () => setOpen(false),
  };

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
    <CartSheetContext.Provider value={sheetContext}>
      <Sheet open={open} onOpenChange={handleOpenChange}>
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
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {cart.items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

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

          {cart?.items && cart.items.length > 0 && (
            <SheetFooter className="flex flex-col gap-2 pt-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                asChild
                onClick={() => setOpen(false)}
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
    </CartSheetContext.Provider>
  );
}

export default CartSheet;

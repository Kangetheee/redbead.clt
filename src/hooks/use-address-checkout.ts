/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from "next/navigation";
import { useCreateAddress as useBaseCreateAddress } from "@/hooks/use-address";
import { CreateAddressDto } from "@/lib/address/dto/address.dto";
import { toast } from "sonner";

interface UseAddressCheckoutOptions {
  sessionId?: string;
  returnUrl?: string;
  onSuccess?: (addressId: string) => void;
}

export function useAddressCheckout(options: UseAddressCheckoutOptions = {}) {
  const router = useRouter();
  const baseCreateAddress = useBaseCreateAddress();

  const createAddress = {
    ...baseCreateAddress,
    mutate: (data: CreateAddressDto, overrides?: any) => {
      baseCreateAddress.mutate(data, {
        ...overrides,
        onSuccess: (response, variables, context) => {
          if (response.success) {
            // Call base onSuccess first
            overrides?.onSuccess?.(response, variables, context);

            // Handle checkout-specific logic
            if (options.sessionId && options.returnUrl) {
              const returnUrl = new URL(
                options.returnUrl,
                window.location.origin
              );
              returnUrl.searchParams.set("selectedAddress", response.data.id);
              returnUrl.searchParams.set("session", options.sessionId);

              // Navigate back to checkout
              router.push(returnUrl.toString());
            } else {
              // Call custom success handler
              options.onSuccess?.(response.data.id);
            }
          }
        },
        onError: (error, variables, context) => {
          // Call base onError first
          overrides?.onError?.(error, variables, context);

          // Additional error handling for checkout context
          if (options.sessionId) {
            toast.error(
              "Failed to create address. Please try again or contact support."
            );
          }
        },
      });
    },
  };

  return createAddress;
}

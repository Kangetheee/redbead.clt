import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const initiatePaymentSchema = z.object({
  method: z.enum(["MPESA", "BANK_TRANSFER", "CARD", "CASH"]).optional(),
  phoneNumber: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;

export const refundRequestSchema = z.object({
  amount: z.number().positive().optional(), // Partial refund amount (optional for full refund)
  reason: z
    .string()
    .min(1, "Refund reason is required")
    .max(500, "Reason cannot exceed 500 characters"),
  metadata: z.record(z.any()).optional(),
});

export type RefundRequestDto = z.infer<typeof refundRequestSchema>;

export const sqroolCallbackSchema = z.object({
  merchant_request_id: z.string().optional(),
  checkout_request_id: z.string().optional(),
  result_code: z.string(),
  result_desc: z.string(),
  amount: z.number().optional(),
  mpesa_receipt_number: z.string().optional(),
  balance: z.string().optional(),
  transaction_date: z.string().optional(),
  phone_number: z.string().optional(),
});

export type SqroolCallbackDto = z.infer<typeof sqroolCallbackSchema>;

// Export payment method types for validation
export const PAYMENT_METHODS = [
  "MPESA",
  "BANK_TRANSFER",
  "CARD",
  "CASH",
] as const;
export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];
export type PaymentStatusType = (typeof PAYMENT_STATUSES)[number];

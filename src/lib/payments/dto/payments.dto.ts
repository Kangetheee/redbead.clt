import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

/**
 * DTO for listing payments with filtering
 */
export const listPaymentsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
  method: z.string().optional(),
  orderId: z.string().optional(),
});

export type ListPaymentsDto = z.infer<typeof listPaymentsSchema>;

/**
 * DTO for creating a new payment
 */
export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  method: z.string().min(1, "Payment method is required"),
  currency: z.string().min(1, "Currency is required"),
  metadata: z.record(z.any()).optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;

/**
 * DTO for initiating payment
 */
export const initiatePaymentSchema = z.object({
  method: z.string().optional(),
  customerPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;

/**
 * DTO for refund requests
 */
export const refundRequestSchema = z.object({
  amount: z.number().positive().optional(), // Partial refund amount (optional for full refund)
  customerPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  reason: z
    .string()
    .min(1, "Refund reason is required")
    .max(500, "Reason cannot exceed 500 characters"),
  metadata: z.record(z.any()).optional(),
});

export type RefundRequestDto = z.infer<typeof refundRequestSchema>;

/**
 * DTO for Sqrool callback
 */
export const sqroolCallbackSchema = z.object({
  TransactionType: z.string().optional(),
  TransID: z.string().optional(),
  TransTime: z.string().optional(),
  TransAmount: z.number().optional(),
  BusinessShortCode: z.string().optional(),
  BillRefNumber: z.string().optional(),
  InvoiceNumber: z.string().optional(),
  OrgAccountBalance: z.number().optional(),
  ThirdPartyTransID: z.string().optional(),
  MSISDN: z.string().optional(),
  FirstName: z.string().optional(),
  MiddleName: z.string().optional(),
  LastName: z.string().optional(),
});

export type SqroolCallbackDto = z.infer<typeof sqroolCallbackSchema>;

// Export payment method types for validation
export const PAYMENT_METHODS = [
  "mpesa",
  "card",
  "bank_transfer",
  "cash",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];
export type PaymentStatusType = (typeof PAYMENT_STATUSES)[number];

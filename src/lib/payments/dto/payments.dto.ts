import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { requiredFloatSchema } from "@/lib/shared/common.dto";

export const initiatePaymentSchema = z.object({
  method: z.enum(["MPESA", "BANK_TRANSFER", "CARD"]),
  phoneNumber: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  metadata: z.object({}).optional(),
});

export type InitiatePaymentDto = z.infer<typeof initiatePaymentSchema>;

export const refundRequestSchema = z.object({
  amount: requiredFloatSchema.transform((val) => parseFloat(val)).optional(),
  reason: z
    .string()
    .min(1, "Refund reason is required")
    .max(500, "Reason too long"),
  metadata: z.object({}).optional(),
});

export type RefundRequestDto = z.infer<typeof refundRequestSchema>;

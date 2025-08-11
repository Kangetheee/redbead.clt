import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const customizationChoiceSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
  valueId: z.string().min(1, "Value ID is required"),
  customValue: z.string().optional(),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  customizations: z.array(customizationChoiceSchema).default([]),
  designId: z.string().optional(),
});

export const initCheckoutSchema = z.object({
  useCartItems: z.boolean().default(true),
  items: z.array(checkoutItemSchema).optional(),
  guestEmail: z.string().email("Invalid email address").optional(),
  couponCode: z.string().optional(),
});

export type InitCheckoutDto = z.infer<typeof initCheckoutSchema>;

export const addressInputSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  companyName: z.string().optional(),
  street: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country code is required").max(2),
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
});

export const shippingCalculationSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  shippingAddress: addressInputSchema,
  urgencyLevel: z
    .enum(["NORMAL", "EXPEDITED", "RUSH", "EMERGENCY"])
    .default("NORMAL"),
});

export type ShippingCalculationDto = z.infer<typeof shippingCalculationSchema>;

export const validateCheckoutSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  shippingAddress: addressInputSchema,
  billingAddress: addressInputSchema.optional(),
  selectedShippingOption: z.string().min(1, "Shipping option is required"),
  paymentMethod: z.enum(["MPESA", "BANK_TRANSFER", "CARD"]),
  customerPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
});

export type ValidateCheckoutDto = z.infer<typeof validateCheckoutSchema>;

export const guestInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
});

export const completeCheckoutSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  shippingAddressId: z.string().optional(), // For authenticated users
  billingAddressId: z.string().optional(), // For authenticated users
  shippingAddress: addressInputSchema.optional(), // For guests
  billingAddress: addressInputSchema.optional(), // For guests
  guestInfo: guestInfoSchema.optional(), // For guests
  selectedShippingOption: z.string().min(1, "Shipping option is required"),
  paymentMethod: z.enum(["MPESA", "BANK_TRANSFER", "CARD"]),
  customerPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .optional(),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type CompleteCheckoutDto = z.infer<typeof completeCheckoutSchema>;

// Guest-specific schemas
export const guestInitCheckoutSchema = z.object({
  guestEmail: z.string().email("Invalid email address"),
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
  couponCode: z.string().optional(),
});

export type GuestInitCheckoutDto = z.infer<typeof guestInitCheckoutSchema>;

export const guestCompleteCheckoutSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  guestInfo: guestInfoSchema,
  shippingAddress: addressInputSchema,
  billingAddress: addressInputSchema.optional(),
  selectedShippingOption: z.string().min(1, "Shipping option is required"),
  paymentMethod: z.enum(["MPESA", "BANK_TRANSFER", "CARD"]),
  customerPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type GuestCompleteCheckoutDto = z.infer<
  typeof guestCompleteCheckoutSchema
>;

export const listCheckoutSessionsSchema = z.object({
  pageIndex: z.number().default(0),
  pageSize: z.number().default(10),
  customerEmail: z.string().email("Invalid email address").optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "COMPLETED"]).optional(),
});

export type ListCheckoutSessionsDto = z.infer<
  typeof listCheckoutSessionsSchema
>;

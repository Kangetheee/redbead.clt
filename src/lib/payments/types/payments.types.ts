/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Payment method configuration returned by GET /v1/payments/methods
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: "MPESA" | "BANK_TRANSFER" | "CARD" | "CASH";
  description: string;
  isActive: boolean;
  configuration?: {
    shortcode?: string;
    tillNumber?: string;
    accountNumber?: string;
    instructions?: string;
    [key: string]: any;
  };
  fees?: {
    percentage?: number;
    fixed?: number;
    minimum?: number;
    maximum?: number;
  };
  limits?: {
    minimum?: number;
    maximum?: number;
  };
}

/**
 * Detailed payment information returned by GET /v1/payments/{orderId}
 */
export interface PaymentDetails {
  id: string;
  orderId: string;
  method: "MPESA" | "BANK_TRANSFER" | "CARD" | "CASH";
  status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  amount: number;
  currency: string;
  reference?: string;
  transactionId?: string;
  externalReference?: string;
  failureReason?: string;
  metadata?: {
    phoneNumber?: string;
    checkoutRequestId?: string;
    merchantRequestId?: string;
    mpesaReceiptNumber?: string;
    [key: string]: any;
  };
  fees?: {
    amount: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

/**
 * Payment initiation response from POST /v1/payments/initiate/{orderId}
 */
export interface PaymentInitiationResponse {
  paymentId: string;
  status: "PENDING" | "PROCESSING";
  paymentUrl?: string;
  qrCode?: string;
  instructions: string;
  expiresAt?: string;
  metadata?: {
    checkoutRequestId?: string;
    merchantRequestId?: string;
    phoneNumber?: string;
    tillNumber?: string;
    accountNumber?: string;
    [key: string]: any;
  };
  nextSteps?: string[];
}

/**
 * Payment status information returned by GET /v1/payments/status/{orderId}
 */
export interface PaymentStatus {
  paymentId: string;
  orderId: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  amount: number;
  currency: string;
  method: "MPESA" | "BANK_TRANSFER" | "CARD" | "CASH";
  reference?: string;
  externalReference?: string;
  transactionId?: string;
  failureReason?: string;
  lastUpdated: string;
  timeline?: PaymentTimelineEvent[];
  metadata?: {
    phoneNumber?: string;
    mpesaReceiptNumber?: string;
    [key: string]: any;
  };
}

/**
 * Payment timeline event for tracking payment progress
 */
export interface PaymentTimelineEvent {
  status: string;
  timestamp: string;
  description: string;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Refund response from POST /v1/payments/refund/{orderId}
 */
export interface RefundResponse {
  refundId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reference?: string;
  externalReference?: string;
  failureReason?: string;
  metadata?: {
    originalTransactionId?: string;
    refundReference?: string;
    [key: string]: any;
  };
  createdAt: string;
  completedAt?: string;
  estimatedCompletionTime?: string;
}

/**
 * Sqrool callback payload structure for POST /v1/payments/callbacks/sqrool
 */
export interface SqroolCallbackPayload {
  merchant_request_id?: string;
  checkout_request_id?: string;
  result_code: string;
  result_desc: string;
  amount?: number;
  mpesa_receipt_number?: string;
  balance?: string;
  transaction_date?: string;
  phone_number?: string;
}

/**
 * Generic payment callback response
 */
export interface PaymentCallbackResponse {
  status: "SUCCESS" | "ERROR";
  message: string;
  paymentId?: string;
  orderId?: string;
}

// Type guards for runtime type checking
export const isPaymentMethod = (obj: any): obj is PaymentMethod => {
  return obj && typeof obj.id === "string" && typeof obj.type === "string";
};

export const isPaymentDetails = (obj: any): obj is PaymentDetails => {
  return obj && typeof obj.id === "string" && typeof obj.orderId === "string";
};

export const isPaymentStatus = (obj: any): obj is PaymentStatus => {
  return (
    obj && typeof obj.paymentId === "string" && typeof obj.status === "string"
  );
};

export const isRefundResponse = (obj: any): obj is RefundResponse => {
  return (
    obj && typeof obj.refundId === "string" && typeof obj.paymentId === "string"
  );
};

// Utility types
export type PaymentMethodType = PaymentMethod["type"];
export type PaymentStatusType = PaymentStatus["status"];
export type RefundStatusType = RefundResponse["status"];

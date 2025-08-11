/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Payment method configuration returned by GET /v1/payments/methods
 */
export interface PaymentMethod {
  name: string;
  value: string;
  enabled: boolean;
}

/**
 * Basic payment information in list responses
 */
export interface PaymentInfo {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  method: string;
  transactionId?: string;
  metadata?: {
    customerPhone?: string;
    provider?: string;
    [key: string]: any;
  };
  createdAt: string;
}

/**
 * Paginated list of payments from GET /v1/payments
 */
export interface PaymentListResponse {
  data: PaymentInfo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

/**
 * Payment summary statistics from GET /v1/payments/summary
 */
export interface PaymentSummary {
  summary: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  totalPayments: number;
  totalAmount: number;
}

/**
 * Detailed payment information returned by GET /v1/payments/{id} or GET /v1/payments/order/{orderId}
 */
export interface PaymentDetails {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  method: string;
  transactionId?: string;
  metadata?: {
    customerPhone?: string;
    provider?: string;
    [key: string]: any;
  };
  createdAt: string;
}

/**
 * Payment initiation response from POST /v1/payments/initiate/{orderId}
 */
export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  customerMessage?: string;
  status: "PENDING" | "PROCESSING";
}

/**
 * Payment status information returned by GET /v1/payments/status/{orderId}
 */
export interface PaymentStatus {
  orderId: string;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  transactionId?: string;
  sqroolResponse?: {
    status: string;
    message: string;
  };
  error?: string;
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
  success: boolean;
  message: string;
  refundId: string;
  status: "PENDING";
}

// Type guards for runtime type checking
export const isPaymentMethod = (obj: any): obj is PaymentMethod => {
  return obj && typeof obj.name === "string" && typeof obj.value === "string";
};

export const isPaymentDetails = (obj: any): obj is PaymentDetails => {
  return obj && typeof obj.id === "string" && typeof obj.orderId === "string";
};

export const isPaymentStatus = (obj: any): obj is PaymentStatus => {
  return (
    obj &&
    typeof obj.orderId === "string" &&
    typeof obj.paymentStatus === "string"
  );
};

export const isRefundResponse = (obj: any): obj is RefundResponse => {
  return (
    obj && typeof obj.success === "boolean" && typeof obj.refundId === "string"
  );
};

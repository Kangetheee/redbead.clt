export interface PaymentMethod {
  id: string;
  name: string;
  type: "MPESA" | "BANK_TRANSFER" | "CARD" | "CASH";
  description: string;
  isActive: boolean;
  configuration?: object;
  fees?: {
    percentage?: number;
    fixed?: number;
    minimum?: number;
    maximum?: number;
  };
}

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
  metadata?: object;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  status: string;
  paymentUrl?: string;
  qrCode?: string;
  instructions: string;
  expiresAt?: string;
  metadata?: {
    checkoutRequestId?: string;
    merchantRequestId?: string;
    phoneNumber?: string;
  };
}

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
  method: string;
  reference?: string;
  externalReference?: string;
  failureReason?: string;
  lastUpdated: string;
  timeline?: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: string;
  metadata?: object;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  reference?: string;
  externalReference?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

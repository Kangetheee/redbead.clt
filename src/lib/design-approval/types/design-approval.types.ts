export interface DesignApproval {
  id: string;
  orderId: string;
  orderNumber: string;
  designId?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  customerEmail: string;
  previewImages: string[];
  designSummary: {
    productName: string;
    quantity: number;
    material?: string;
    text?: string;
    colors?: string[];
    dimensions?: string;
    printType?: string;
    attachment?: string;
  };
  requestedAt: string;
  respondedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  expiresAt?: string;
  isExpired: boolean;
  canApprove: boolean;
  canReject: boolean;
  timeRemaining?: string;
  comments?: string;
  requestRevision?: boolean;
  message: string;
  orderDetails: {
    orderNumber: string;
    totalAmount: number;
    itemCount: number;
    customer: {
      name: string;
      company?: string;
    };
  };
}

export interface ApprovalStatus {
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  isExpired: boolean;
  expiresAt?: string;
  timeRemaining?: string;
  canApprove: boolean;
  canReject: boolean;
  message: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fetcher } from "../api/api.service";
import {
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
  ApproveDesignDto,
  RejectDesignDto,
} from "./dto/design-approval.dto";
import {
  DesignApproval,
  DesignApprovalDetail,
  ApprovalActionResponse,
  ApprovalStatusResponse,
  TokenBasedApproval,
  DesignApprovalStats,
} from "./types/design-approval.types";

export class DesignApprovalService {
  constructor(private fetcher = new Fetcher()) {}

  // Admin methods (require authentication)

  /**
   * Request design approval for an order
   */
  public async requestDesignApproval(
    orderId: string,
    data: RequestDesignApprovalDto
  ): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/request-design-approval`,
      {
        method: "POST",
        data,
      }
    );
  }

  /**
   * Get design approval status for an order
   */
  public async getDesignApprovalStatus(
    orderId: string
  ): Promise<DesignApprovalDetail> {
    return this.fetcher.request<DesignApprovalDetail>(
      `/v1/orders/${orderId}/design-approval`
    );
  }

  /**
   * Update design approval (admin only)
   */
  public async updateDesignApproval(
    orderId: string,
    data: UpdateDesignApprovalDto
  ): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`,
      {
        method: "PATCH",
        data,
      }
    );
  }

  /**
   * Get design approval statistics
   */
  public async getDesignApprovalStats(): Promise<DesignApprovalStats> {
    return this.fetcher.request<DesignApprovalStats>(
      "/v1/orders/design-approval/stats"
    );
  }

  // Public methods (no authentication required)

  /**
   * Get design approval details by token (public endpoint)
   */
  public async getApprovalByToken(token: string): Promise<TokenBasedApproval> {
    return this.fetcher.request<TokenBasedApproval>(
      `/v1/approval/${token}`,
      {},
      { auth: false } // No authentication required
    );
  }

  /**
   * Approve design by token (public endpoint)
   */
  public async approveDesignByToken(
    token: string,
    data: ApproveDesignDto
  ): Promise<ApprovalActionResponse> {
    return this.fetcher.request<ApprovalActionResponse>(
      `/v1/approval/${token}/approve`,
      {
        method: "POST",
        data,
      },
      { auth: false } // No authentication required
    );
  }

  /**
   * Reject design by token (public endpoint)
   */
  public async rejectDesignByToken(
    token: string,
    data: RejectDesignDto
  ): Promise<ApprovalActionResponse> {
    return this.fetcher.request<ApprovalActionResponse>(
      `/v1/approval/${token}/reject`,
      {
        method: "POST",
        data,
      },
      { auth: false } // No authentication required
    );
  }

  /**
   * Check approval status by token (public endpoint)
   */
  public async getApprovalStatusByToken(
    token: string
  ): Promise<ApprovalStatusResponse> {
    return this.fetcher.request<ApprovalStatusResponse>(
      `/v1/approval/${token}/status`,
      {},
      { auth: false } // No authentication required
    );
  }

  // Email-related methods

  /**
   * Send design approval email
   */
  public async sendDesignApprovalEmail(data: {
    orderId: string;
    customerEmail: string;
    customerName?: string;
    designSummary: any;
    previewImages: string[];
    expiryDays?: number;
  }): Promise<{ message: string; emailId: string }> {
    return this.fetcher.request<{ message: string; emailId: string }>(
      "/v1/emails/send-design-approval",
      {
        method: "POST",
        data,
      }
    );
  }

  /**
   * Resend design approval email
   */
  public async resendApprovalEmail(
    emailId: string
  ): Promise<{ message: string }> {
    return this.fetcher.request<{ message: string }>(
      `/v1/emails/${emailId}/resend`,
      {
        method: "POST",
      }
    );
  }
}

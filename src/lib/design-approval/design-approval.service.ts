import { Fetcher } from "../api/api.service";
import { RejectDesignByTokenDto } from "./dto/design-approval.dto";
import {
  ApproveDesignResponse,
  RejectDesignResponse,
  ResendApprovalEmailResponse,
} from "./types/design-approval.types";

export class DesignApprovalService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Approve design via email token
   * GET /v1/design-approvals/approve/{token}
   *
   * Customer approves design using token from email
   */
  public async approveDesignByToken(
    token: string
  ): Promise<ApproveDesignResponse> {
    return this.fetcher.request<ApproveDesignResponse>(
      `/v1/design-approvals/approve/${token}`,
      {
        method: "GET",
      },
      { auth: false } // No authentication required for public endpoints
    );
  }

  /**
   * Reject design via email token
   * GET /v1/design-approvals/reject/{token}
   *
   * Customer rejects design using token from email with reason
   */
  public async rejectDesignByToken(
    token: string,
    data: RejectDesignByTokenDto
  ): Promise<RejectDesignResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("reason", data.reason);

    return this.fetcher.request<RejectDesignResponse>(
      `/v1/design-approvals/reject/${token}?${queryParams.toString()}`,
      {
        method: "GET",
      },
      { auth: false } // No authentication required for public endpoints
    );
  }

  /**
   * Resend approval email
   * POST /v1/design-approvals/{id}/resend
   *
   * Resend design approval email to customer
   */
  public async resendApprovalEmail(
    approvalId: string
  ): Promise<ResendApprovalEmailResponse> {
    return this.fetcher.request<ResendApprovalEmailResponse>(
      `/v1/design-approvals/${approvalId}/resend`,
      {
        method: "POST",
      }
    );
  }
}

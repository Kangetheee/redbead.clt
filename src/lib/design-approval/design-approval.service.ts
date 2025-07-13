import { Fetcher } from "../api/api.service";
import { ApproveDesignDto, RejectDesignDto } from "./dto/design-approval.dto";
import { DesignApproval, ApprovalStatus } from "./types/design-approval.types";

export class DesignApprovalService {
  constructor(private fetcher = new Fetcher()) {}

  public async getApprovalDetails(token: string) {
    return this.fetcher.request<DesignApproval>(
      `/v1/approval/${token}`,
      {},
      { auth: false } // No authentication required
    );
  }

  public async approveDesign(token: string, values: ApproveDesignDto) {
    return this.fetcher.request<DesignApproval>(
      `/v1/approval/${token}/approve`,
      {
        method: "POST",
        data: values,
      },
      { auth: false } // No authentication required
    );
  }

  public async rejectDesign(token: string, values: RejectDesignDto) {
    return this.fetcher.request<DesignApproval>(
      `/v1/approval/${token}/reject`,
      {
        method: "POST",
        data: values,
      },
      { auth: false } // No authentication required
    );
  }

  public async getApprovalStatus(token: string) {
    return this.fetcher.request<ApprovalStatus>(
      `/v1/approval/${token}/status`,
      {},
      { auth: false } // No authentication required
    );
  }
}

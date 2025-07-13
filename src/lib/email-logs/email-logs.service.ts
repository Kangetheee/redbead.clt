/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { GetEmailLogsDto } from "./dto/email-log.dto";
import { EmailLog, EmailLogDetail } from "./types/email-logs.types";

export class EmailLogsService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(params?: GetEmailLogsDto) {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.recipientEmail) {
      queryParams.append("recipientEmail", params.recipientEmail);
    }
    if (params?.orderId) {
      queryParams.append("orderId", params.orderId);
    }
    if (params?.templateId) {
      queryParams.append("templateId", params.templateId);
    }
    if (params?.dateFrom) {
      queryParams.append("dateFrom", params.dateFrom);
    }
    if (params?.dateTo) {
      queryParams.append("dateTo", params.dateTo);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `/v1/emails/logs${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<EmailLog>>(url);
  }

  public async findById(logId: string) {
    return this.fetcher.request<EmailLogDetail>(`/v1/emails/logs/${logId}`);
  }

  public async resendEmail(emailId: string) {
    return this.fetcher.request<{ message: string }>(
      `/v1/emails/${emailId}/resend`,
      {
        method: "POST",
      }
    );
  }

  public async getAnalytics() {
    return this.fetcher.request<any>("/v1/emails/analytics");
  }
}

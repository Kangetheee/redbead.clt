"use server";

import { getErrorMessage } from "../get-error-message";
import { EnquiriesService } from "./enquiries.service";
import { CreateInquiryDto, GetInquiriesParams } from "./types/enquiries.types";

const enquiryService = new EnquiriesService();

export async function getWebsiteInquiriesAction(params?: GetInquiriesParams) {
  try {
    const inquiries = await enquiryService.getAll(params);
    return { success: true as const, data: inquiries };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

export async function getWebsiteInquiriesWithQueryAction(query?: string) {
  try {
    const inquiries = await enquiryService.getAllWithQuery(query);
    return { success: true as const, data: inquiries };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

export async function createInquiryAction(data: CreateInquiryDto) {
  try {
    const response = await enquiryService.create(data);
    return { success: true as const, data: response };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

export async function buildEnquiriesQuery(
  params: GetInquiriesParams
): Promise<string> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.email) queryParams.append("email", params.email);
  if (params.phone) queryParams.append("phone", params.phone);
  if (params.name) queryParams.append("name", params.name);
  if (params.subject) queryParams.append("subject", params.subject);
  if (params.contactPreference)
    queryParams.append("contactPreference", params.contactPreference);
  if (params.bulkOrders !== undefined)
    queryParams.append("bulkOrders", params.bulkOrders.toString());

  return queryParams.toString();
}

"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { CreateFaqDto, UpdateFaqDto } from "./dto/faq.dto";
import { FaqsService } from "./faqs.service";
import { Faq, FaqsQueryParams, PaginatedFaqsResponse } from "./types/faq.types";

const faqsService = new FaqsService();

export async function getFaqsAction(
  params?: FaqsQueryParams
): Promise<ActionResponse<PaginatedFaqsResponse>> {
  try {
    const faqs = await faqsService.getAll(params);
    // console.log("API Response:", JSON.stringify(faqs, null, 2).substring(0, 500));
    return { success: true, data: faqs };
  } catch (error) {
    // console.error("Error fetching FAQs:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getFaqByIdAction(
  id: string
): Promise<ActionResponse<Faq>> {
  try {
    const faq = await faqsService.getById(id);
    return { success: true, data: faq };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createFaqAction(
  data: CreateFaqDto
): Promise<ActionResponse<{ id: string }>> {
  try {
    const faq = await faqsService.create(data);
    return { success: true, data: faq };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateFaqAction(
  id: string,
  data: UpdateFaqDto
): Promise<ActionResponse<{ id: string }>> {
  try {
    const faq = await faqsService.update(id, data);
    return { success: true, data: faq };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteFaqAction(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const faq = await faqsService.delete(id);
    return { success: true, data: faq };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

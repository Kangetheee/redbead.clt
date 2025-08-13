"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { CreateFaqDto } from "./dto/faq.dto";
import { FaqsService } from "./faqs.service";
import { Faq } from "./types/faq.types";

const faqsService = new FaqsService();

export async function getFaqsAction(
  query?: string
): Promise<ActionResponse<Faq[]>> {
  try {
    const faqs = await faqsService.find(query);
    return { success: true, data: faqs };
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
  data: CreateFaqDto
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

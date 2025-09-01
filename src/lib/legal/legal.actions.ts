"use server";

import { getErrorMessage } from "../get-error-message";
import { CreateLegalDto } from "./dto/legal.dto";
import { LegalService } from "./legal.service";
import { LegalTypeEnum } from "./types/legal.types";

const legalService = new LegalService();

export async function getLegalAction(type: LegalTypeEnum) {
  try {
    const legal = await legalService.findOne(type);
    return { success: true as const, data: legal };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

export async function createLegalAction(data: CreateLegalDto) {
  try {
    const res = await legalService.create(data);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

export async function updateLegalAction(legalId: string, data: CreateLegalDto) {
  try {
    const res = await legalService.update(legalId, data);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

export async function deleteLegalAction(legalId: string) {
  try {
    const res = await legalService.delete(legalId);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, error: getErrorMessage(error) };
  }
}

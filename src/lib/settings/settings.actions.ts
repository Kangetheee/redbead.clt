"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/settings.dto";
import { Settings } from "./types/settings.types";

const settingsService = new SettingsService();

export async function getSettingsAction(): Promise<ActionResponse<Settings>> {
  try {
    const res = await settingsService.getSettings();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateSettingsAction(
  data: UpdateSettingsDto
): Promise<ActionResponse<Settings>> {
  try {
    const res = await settingsService.updateSettings(data);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

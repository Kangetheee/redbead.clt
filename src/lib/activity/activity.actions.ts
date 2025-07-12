"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import { ActivityLogService } from "./activity.service";
import { ActivityLog } from "./types/activity.types";

const activityLogService = new ActivityLogService();

export async function getActivityLogsAction(): Promise<
  ActionResponse<PaginatedData<ActivityLog>>
> {
  try {
    const res = await activityLogService.findAll();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

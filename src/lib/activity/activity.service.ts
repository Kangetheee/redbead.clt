import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { ActivityLog } from "./types/activity.types";

export class ActivityLogService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll() {
    return this.fetcher.request<PaginatedData<ActivityLog>>("/v1/activities");
  }
}

import { Fetcher } from "../api/api.service";
import { UpdateSettingsDto } from "./dto/settings.dto";
import { Settings } from "./types/settings.types";

export class SettingsService {
  constructor(private fetcher = new Fetcher()) {}

  public async getSettings() {
    return this.fetcher.request<Settings>("/v1/settings");
  }

  public async updateSettings(data: UpdateSettingsDto) {
    return this.fetcher.request<Settings>("/v1/settings", {
      method: "PATCH",
      data,
    });
  }
}

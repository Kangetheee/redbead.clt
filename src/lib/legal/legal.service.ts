import "server-only";

import { Fetcher } from "../api/api.service";
import { CreateLegalDto } from "./dto/legal.dto";
import { Legal, LegalTypeEnum } from "./types/legal.types";

export class LegalService {
  constructor(private fetcher = new Fetcher()) {}

  async create(data: CreateLegalDto) {
    return this.fetcher.request<{ id: string }>(`/v1/legal`, {
      method: "POST",
      data,
    });
  }

  async update(legalId: string, data: CreateLegalDto) {
    return this.fetcher.request<{ id: string }>(`/v1/legal/${legalId}`, {
      method: "PATCH",
      data,
    });
  }

  async findOne(type: LegalTypeEnum) {
    return this.fetcher.request<Legal>(`/v1/legal/${type}`);
  }

  async delete(legalId: string) {
    return this.fetcher.request<{ id: string }>(`/v1/legal/${legalId}`, {
      method: "DELETE",
    });
  }
}

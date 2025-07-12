"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import { CreateRoleDto } from "./dto/roles.dto";
import { RoleService } from "./roles.service";
import { Module, RoleDetailsResponse, RoleResponse } from "./types/roles.types";

const roleService = new RoleService();

export async function getRolesAction(): Promise<
  ActionResponse<PaginatedData<RoleResponse>>
> {
  try {
    const res = await roleService.findAll();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getRoleAction(
  roleId: string
): Promise<ActionResponse<RoleDetailsResponse>> {
  try {
    const res = await roleService.findById(roleId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createRoleAction(
  values: CreateRoleDto,
  roleId?: string
): Promise<ActionResponse<void>> {
  try {
    if (roleId) {
      await roleService.update(roleId, values);
    } else {
      await roleService.create(values);
    }
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteRoleAction(
  roleId: string
): Promise<ActionResponse<void>> {
  try {
    await roleService.delete(roleId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function findAllModulesAction(): Promise<
  ActionResponse<Module[]>
> {
  try {
    const res = await roleService.findAllModules();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

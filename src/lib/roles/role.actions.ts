"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import { CreateRoleDto, GetRolesDto, UpdateRoleDto } from "./dto/roles.dto";
import { RoleService } from "./roles.service";
import {
  Module,
  PermissionAction,
  RoleDetailsResponse,
  RoleResponse,
  Subject,
} from "./types/roles.types";

const roleService = new RoleService();

export async function getRolesAction(
  params?: GetRolesDto
): Promise<ActionResponse<PaginatedData<RoleResponse>>> {
  try {
    const res = await roleService.findAll(params);
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
  values: CreateRoleDto
): Promise<ActionResponse<RoleDetailsResponse>> {
  try {
    const res = await roleService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateRoleAction(
  roleId: string,
  values: UpdateRoleDto
): Promise<ActionResponse<RoleDetailsResponse>> {
  try {
    const res = await roleService.update(roleId, values);
    return { success: true, data: res };
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

export async function getRoleModulesAction(): Promise<
  ActionResponse<Module[]>
> {
  try {
    const res = await roleService.findAllModules();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getRoleSubjectsAction(): Promise<
  ActionResponse<Subject[]>
> {
  try {
    const res = await roleService.findAllSubjects();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getRoleActionsAction(): Promise<
  ActionResponse<PermissionAction[]>
> {
  try {
    const res = await roleService.findAllActions();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

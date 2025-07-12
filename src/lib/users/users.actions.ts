"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserDetail, UserResponse } from "./types/users.types";
import { UserService } from "./users.service";

const userService = new UserService();

export async function getUsersAction(
  query?: string
): Promise<ActionResponse<PaginatedData<UserResponse>>> {
  try {
    const res = await userService.findAll(query);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getUserAction(
  userId: string
): Promise<ActionResponse<UserDetail>> {
  try {
    const res = await userService.findById(userId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createUserAction(
  values: CreateUserDto
): Promise<ActionResponse<void>> {
  try {
    await userService.create(values);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateUserAction(
  userId: string,
  values: UpdateUserDto
): Promise<ActionResponse<void>> {
  try {
    await userService.update(userId, values);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

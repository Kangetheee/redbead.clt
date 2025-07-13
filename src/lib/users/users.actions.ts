"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse, PaginatedData } from "../shared/types";
import { CreateUserDto, UpdateUserDto, GetUsersDto } from "./dto/users.dto";
import { UserDetail, UserResponse, UserProfile } from "./types/users.types";
import { UserService } from "./users.service";

const userService = new UserService();

export async function getUsersAction(
  params?: GetUsersDto
): Promise<ActionResponse<PaginatedData<UserResponse>>> {
  try {
    const res = await userService.findAll(params);
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
): Promise<ActionResponse<UserDetail>> {
  try {
    const res = await userService.create(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateUserAction(
  userId: string,
  values: UpdateUserDto
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await userService.update(userId, values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteUserAction(
  userId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await userService.delete(userId);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Profile actions
export async function getUserProfileAction(): Promise<
  ActionResponse<UserProfile>
> {
  try {
    const res = await userService.getProfile();
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateUserProfileAction(
  values: UpdateUserDto
): Promise<ActionResponse<{ message: string }>> {
  try {
    const res = await userService.updateProfile(values);
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

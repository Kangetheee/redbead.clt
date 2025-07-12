"use server";

import { getErrorMessage } from "../get-error-message";
import { destroySession } from "../session/session";
import { ActionResponse } from "../shared/types";
import { AuthService } from "./auth.service";
import { RefreshTokenDto, ResetPasswordDto, SignInDto } from "./dto/auth.dto";
import { RefreshTokenResponse } from "./interfaces/auth.interface";

const authService = new AuthService();

export async function signInAction(
  values: SignInDto
): Promise<ActionResponse<void>> {
  try {
    await authService.signIn(values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function refreshTokenAction(
  values: RefreshTokenDto
): Promise<ActionResponse<RefreshTokenResponse>> {
  try {
    const result = await authService.refreshToken(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function resetPasswordAction(
  values: ResetPasswordDto
): Promise<ActionResponse<void>> {
  try {
    await authService.resetPassword(values);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function signOutAction(): Promise<ActionResponse<void>> {
  try {
    await destroySession();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

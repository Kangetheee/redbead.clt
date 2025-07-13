"use server";

import { getErrorMessage } from "../get-error-message";
import { destroySession } from "../session/session";
import { ActionResponse } from "../shared/types";
import { AuthService } from "./auth.service";
import {
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  RequestOtpDto,
  SignInOtpDto,
  VerifyPhoneDto,
  ConfirmPhoneDto,
  SignUpDto,
} from "./dto/auth.dto";
import {
  RefreshTokenResponse,
  SignInResponse,
  RequestOtpResponse,
  SignInOtpResponse,
  ResetPasswordResponse,
  VerifyPhoneResponse,
  ConfirmPhoneResponse,
  SignUpResponse,
} from "./interfaces/auth.interface";
import { redirect } from "next/navigation";

const authService = new AuthService();

export async function signInAction(
  values: SignInDto
): Promise<ActionResponse<SignInResponse>> {
  try {
    const result = await authService.signIn(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function requestOtpAction(
  values: RequestOtpDto
): Promise<ActionResponse<RequestOtpResponse>> {
  try {
    const result = await authService.requestOtp(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function signInWithOtpAction(
  values: SignInOtpDto
): Promise<ActionResponse<SignInOtpResponse>> {
  try {
    const result = await authService.signInWithOtp(values);
    return { success: true, data: result };
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

export async function signOutFormAction(): Promise<void> {
  try {
    await authService.signOut();
  } catch (error) {
    // Even if the API call fails, we should still destroy the local session
    try {
      await destroySession();
    } catch (destroyError) {
      console.error("Failed to destroy session:", destroyError);
    }
    console.error("Sign out error:", getErrorMessage(error));
  } finally {
    // Always redirect to sign-in page after sign out attempt
    redirect("/sign-in");
  }
}

export async function resetPasswordAction(
  values: ResetPasswordDto
): Promise<ActionResponse<ResetPasswordResponse>> {
  try {
    const result = await authService.resetPassword(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function verifyPhoneAction(
  values: VerifyPhoneDto
): Promise<ActionResponse<VerifyPhoneResponse>> {
  try {
    const result = await authService.verifyPhone(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function confirmPhoneAction(
  values: ConfirmPhoneDto
): Promise<ActionResponse<ConfirmPhoneResponse>> {
  try {
    const result = await authService.confirmPhone(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function signUpAction(
  values: SignUpDto
): Promise<ActionResponse<SignUpResponse>> {
  try {
    const result = await authService.signUp(values);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

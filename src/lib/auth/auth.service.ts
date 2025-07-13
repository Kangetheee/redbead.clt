import { Fetcher } from "../api/api.service";
import { createSession, destroySession } from "../session/session";
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
  SignOutResponse,
  VerifyPhoneResponse,
  ConfirmPhoneResponse,
  SignUpResponse,
} from "./interfaces/auth.interface";

export class AuthService {
  constructor(private fetcher = new Fetcher()) {}

  async signIn(data: SignInDto) {
    const res = await this.fetcher.request<SignInResponse>(
      "/v1/auth/sign-in",
      { data, method: "POST" },
      { auth: false }
    );

    await createSession({
      ...res,
      refreshToken: res.refreshToken,
    });

    return res;
  }

  async requestOtp(data: RequestOtpDto) {
    const res = await this.fetcher.request<RequestOtpResponse>(
      "/v1/auth/sign-in/request-otp",
      { data, method: "POST" },
      { auth: false }
    );

    return res;
  }

  async signInWithOtp(data: SignInOtpDto) {
    const res = await this.fetcher.request<SignInOtpResponse>(
      "/v1/auth/sign-in/otp",
      { data, method: "POST" },
      { auth: false }
    );

    await createSession({
      ...res,
      refreshToken: res.refreshToken,
    });

    return res;
  }

  async refreshToken(data: RefreshTokenDto) {
    const res = await this.fetcher.request<RefreshTokenResponse>(
      "/v1/auth/refresh",
      { data, method: "POST" },
      { auth: false }
    );

    // Update session with new tokens
    await createSession({
      ...res,
      refreshToken: res.refreshToken,
    });

    return res;
  }

  async signOut() {
    const res = await this.fetcher.request<SignOutResponse>(
      "/v1/auth/sign-out",
      { method: "POST", data: {} },
      { auth: true }
    );

    await destroySession();

    return res;
  }

  async resetPassword(data: ResetPasswordDto) {
    const res = await this.fetcher.request<ResetPasswordResponse>(
      "/v1/auth/reset-password",
      { data, method: "POST" },
      { auth: false }
    );

    return res;
  }

  async verifyPhone(data: VerifyPhoneDto) {
    const res = await this.fetcher.request<VerifyPhoneResponse>(
      "/v1/auth/sign-up/verify-phone",
      { data, method: "POST" },
      { auth: false }
    );

    return res;
  }

  async confirmPhone(data: ConfirmPhoneDto) {
    const res = await this.fetcher.request<ConfirmPhoneResponse>(
      "/v1/auth/sign-up/confirm-phone",
      { data, method: "POST" },
      { auth: false }
    );

    return res;
  }

  async signUp(data: SignUpDto) {
    const res = await this.fetcher.request<SignUpResponse>(
      "/v1/auth/sign-up",
      { data, method: "POST" },
      { auth: false }
    );

    // Create session for the newly registered user
    await createSession({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      user: res.user,
    });

    return res;
  }
}

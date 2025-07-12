import { Fetcher } from "../api/api.service";
import { createSession } from "../session/session";
import { RefreshTokenDto, ResetPasswordDto, SignInDto } from "./dto/auth.dto";
import {
  RefreshTokenResponse,
  SignInResponse,
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

  async resetPassword(data: ResetPasswordDto) {
    await this.fetcher.request<{ message: string }>(
      "/v1/auth/reset-password",
      { data, method: "POST" },
      { auth: false }
    );
  }
}

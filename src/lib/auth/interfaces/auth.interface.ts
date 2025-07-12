import { Session } from "@/lib/session/session.types";

export type SignInResponse = Session & {
  refreshToken: string;
};

export type RefreshTokenResponse = Session & {
  refreshToken: string;
};

export type ResetPasswordResponse = {
  message: string;
};

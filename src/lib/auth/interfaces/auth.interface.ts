import { Session } from "@/lib/session/session.types";

// Import Permission type from session types
type Permission = Session["user"]["permissions"] extends (infer U)[] | undefined
  ? U
  : never;

export type SignInResponse = Session & {
  refreshToken: string;
};

export type RequestOtpResponse = {
  message: string;
};

export type SignInOtpResponse = Session & {
  refreshToken: string;
};

export type RefreshTokenResponse = Session & {
  refreshToken: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type SignOutResponse = {
  message: string;
};

export type VerifyPhoneResponse = {
  message: string;
  expiresIn: number;
};

export type ConfirmPhoneResponse = {
  message: string;
  verificationToken: string;
  expiresIn: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
};

export type User = {
  id: string;
  role: string;
  avatar: string | null | undefined;
  phone: string;
  permissions: Permission[] | undefined;
};

export type SignUpResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  customer: Customer;
};

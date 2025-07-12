import { Permission } from "../roles/types/permission.type";

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: string;
    avatar: string | null | undefined;
    phone: string;
    permissions: Permission[] | undefined;
  };
}

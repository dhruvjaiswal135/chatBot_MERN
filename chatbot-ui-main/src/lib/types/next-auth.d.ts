import { DefaultSession, User as DefaultUser } from "next-auth";

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerifiedAt: string;
  phone: string;
  phoneVerifiedAt: string;
  avatar: string;
  mfa_enabled: boolean;
  mfa_secret: string | null;
  loginAttempts: number;
  inactiveTill: string | null;
  roleId: number;
  permissions: {
    all: boolean;
  };
  status: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      token: string;
      refreshToken: string;
      userData: UserData | Record<string, unknown>;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    token: string;
    refreshToken: string;
    userData: UserData | Record<string, unknown>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    token: string;
    refreshToken?: string;
    userData?: UserData;
  }
} 
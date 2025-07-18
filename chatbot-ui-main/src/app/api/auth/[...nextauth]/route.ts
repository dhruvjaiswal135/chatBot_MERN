import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

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

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        reference: { label: "Reference", type: "text" },
        step: { label: "Step", type: "text" } // Only "verify" step
      },
      async authorize(credentials) {
        if (!credentials?.otp || !credentials?.reference) {
          return null;
        }

        try {
          // Only handle OTP verification step
          if (credentials.step === "verify") {
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/management/auth/login/validate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                reference: credentials.reference,
                code: credentials.otp,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Invalid OTP");
            }

            const verifyData = await verifyResponse.json();
            
            if (verifyData.status && verifyData.data?.user && verifyData.data?.auth) {
              return {
                id: String(verifyData.data.user.id) || "",
                email: String(verifyData.data.user.email) || "",
                name: String(`${verifyData.data.user.firstName || ""} ${verifyData.data.user.lastName || ""}`) || "",
                token: String(verifyData.data.auth) || "",
                refreshToken: String(verifyData.data.refresh) || "",
                userData: verifyData.data.user || {},
              };
            }
            
            return null;
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | Record<string, unknown> }) {
      if (user) {
        const typedUser = user as User;
        token.id = typedUser.id;
        token.email = typedUser.email || "";
        token.name = typedUser.name || "";
        token.token = typedUser.token;
        token.refreshToken = typedUser.refreshToken;
        token.userData = typedUser.userData as UserData | undefined;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const customFields = {
        id: (token.id as string) ?? "",
        email: (token.email as string) ?? "",
        name: (token.name as string) ?? "",
        token: (token.token as string) ?? "",
        refreshToken: token.refreshToken as string | undefined,
        userData: token.userData as UserData | undefined,
      };
      return {
        ...session,
        user: {
          ...(session.user ?? { name: "", email: "", image: "" }),
          ...customFields,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 